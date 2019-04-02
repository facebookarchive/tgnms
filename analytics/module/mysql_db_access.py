#!/usr/bin/env python3

"""
   Provide MySqlDbAccess class, which will provide IO between the analytics
   and the MySQL database.
"""

import pymysql
import os
import json
import logging
import sys

from module.path_store import PathStore

from terragraph_thrift.Controller.ttypes import ScanFwStatus


class MySqlDbAccess(object):
    """
    Interface to access MySQL database. Used for API service setting fetching.
    """

    # TODO: add the Beringei Query Server setting fetching once the topologies table
    # in MySQL is refactored and contains BQS setting.

    def __new__(cls, database_name="cxl"):
        """Create new MySqlDbAccess object if MySQL database username and password
           are uniquely found in the docker env file.
        Args:
        database_name: name of the MySQL database.

        Return: MySqlDbAccess object on success.
                None on failure.
        """

        # TODO: Currently, The MySQL password/username is in a .env file and
        # create them as environment variable during docker-compose,
        # which is not the safest way. Need to figure right encryption flow
        # before large-scale deployment.

        try:
            with open(PathStore.ANALYTICS_CONFIG_FILE) as config_file:
                analytics_config = json.load(config_file)
        except Exception:
            logging.error("Cannot find the configuration file")
            return None

        if (
            "MYSQL" not in analytics_config
            or "hostname" not in analytics_config["MYSQL"]
        ):
            logging.error("Cannot find MySQL config in the configurations")
            return None
        mysql_host_ip = analytics_config["MYSQL"]["hostname"]

        instance = super().__new__(cls)

        try:
            if "MYSQL_USER" not in os.environ:
                raise ValueError("Missing environment variable of 'MYSQL_USER'")
            mysql_username = os.environ["MYSQL_USER"]
            if "MYSQL_PASS" not in os.environ:
                raise ValueError("Missing environment variable of 'MYSQL_PASS'")
            mysql_password = os.environ["MYSQL_PASS"]

        except BaseException as err:
            logging.error(
                (
                    "Error during loading MySQL environment info"
                    "error {}".format(err.args)
                )
            )
            return None

        try:
            # Connect to the MySQL database
            instance.__connection = pymysql.connect(
                host=mysql_host_ip,
                user=mysql_username,
                password=mysql_password,
                db=database_name,
                charset="utf8mb4",
                cursorclass=pymysql.cursors.DictCursor,
            )
        except BaseException as err:
            logging.error("Error during MySQL connection setup: {}".format(err.args))
            return None

        return instance

    def close_connection(self):
        """Close the MySQL connection and remove all MySQL settings.
        """
        self.__connection.close()

    def read_api_service_setting(self, use_primary_controller=True):
        """Read the API service setting from MySQL.
        Args:
        use_primary_controller: True for Primary Controller info; False for
                Backup Controller info.

        Return: dict which maps the topology names to the corresponding
                api_service ip/port. Each mapped topology name is a dict with
                key of "api_ip" and "api_port". Raise exception on error.
        """
        api_service_config = {}

        with self.__connection.cursor() as cursor:
            if use_primary_controller:
                controller = "primary_controller"
            else:
                controller = "backup_controller"

            sql_string = (
                "SELECT topology.id, name, api_ip, api_port, e2e_ip, e2e_port FROM "
                + "topology INNER JOIN controller ON {}=controller.id;".format(
                    controller
                )
            )
            try:
                cursor.execute(sql_string)
            except BaseException as err:
                logging.error(err.args)
                return {}

            results = cursor.fetchall()
            for api_result in results:
                if api_result["name"] in api_service_config:
                    raise ValueError(
                        "Find multiple api set up for network", api_result["name"]
                    )
                api_service_config[api_result["name"]] = {}
                api_service_config[api_result["name"]]["api_ip"] = api_result["api_ip"]
                api_service_config[api_result["name"]]["api_port"] = api_result[
                    "api_port"
                ]
                api_service_config[api_result["name"]]["id"] = api_result["id"]
                api_service_config[api_result["name"]]["e2e_ip"] = api_result["e2e_ip"]
                api_service_config[api_result["name"]]["e2e_port"] = api_result[
                    "e2e_port"
                ]
                api_service_config[api_result["name"]]["name"] = api_result["name"]

        return api_service_config

    def read_scan_results(self, network_name, scan_type=None, status_complete=True):
        """Read the scan results from MySQL database.
        Args:
        network_name: topology name, like "tower G".
        scan_type: scan types, should be int from the thrift enum ScanType.
        status_complete: if True, will limit to scan reports with complete status.

        Return:
        results: The fetched scan results, is a list of returns. Each element
                 is dict with column name being the key.
                 Raise exception on error.
        """

        with self.__connection.cursor() as cursor:
            t_fields_str = (
                "SELECT CONVERT(UNCOMPRESS(rx_scan_results.scan_resp) USING 'utf8') "
                "AS 'rx_scan_resp', "
                "tx_scan_results.scan_type AS 'scan_type', "
                "tx_scan_results.tx_node_name AS 'tx_node_name', "
                "rx_scan_results.rx_node_name AS 'rx_node_name', "
                "tx_scan_results.tx_node_id AS 'tx_node_id', "
                "tx_scan_results.start_bwgd AS 'start_bwgd', "
                "tx_scan_results.tx_power AS 'tx_power' "
            )

            t_fields_str += (
                "FROM tx_scan_results JOIN rx_scan_results ON "
                + "rx_scan_results.tx_id=tx_scan_results.id "
                + "WHERE network='{}'".format(network_name)
            )

            if scan_type:
                t_fields_str += " AND scan_type={} ".format(str(scan_type))

            if status_complete:
                complete_str = str(ScanFwStatus.COMPLETE)
                t_fields_str += (
                    " AND tx_scan_results.status={} AND rx_scan_results.status={}"
                ).format(complete_str, complete_str)

            # Find each node's most recent IM scan tx time
            latest_scan_time = (
                "SELECT t_time.start_bwgd "
                "FROM tx_scan_results AS t_time "
                "WHERE t_time.status={} "
                "AND t_time.tx_node_id=t_fields.tx_node_id "
                "AND t_time.scan_type=t_fields.scan_type "
                "ORDER BY t_time.start_bwgd DESC "
                "LIMIT 1"
            ).format(ScanFwStatus.COMPLETE)

            sql_string = (
                "SELECT * FROM ({}) AS t_fields WHERE t_fields.start_bwgd=({});"
            ).format(t_fields_str, latest_scan_time)

            logging.debug("Sending SQL query of '{}' to MySQL".format(sql_string))

            try:
                cursor.execute(sql_string)
            except BaseException as err:
                raise ValueError("MySQL execution error: {}".format(err.args))

            results = cursor.fetchall()

        return results
