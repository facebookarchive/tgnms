#!/usr/bin/env python3
# Copyright 2004-present Facebook. All Rights Reserved.

"""
This example shows how to use the tglib 'init' function to create a simple
microservice for consuming messages from the Kafka 'stats' and 'hf_stats'
topics.

The 'main' function defines the Kafka consumer business logic. To get a Kafka
consumer object, simply create one using the constructor. A set of clients
(only the KAFKA_CONSUMER variant is needed in this case) are supplied along with
a lambda function wrapping the 'main' function to 'init'.
"""

import json
import logging
import sys
from typing import Dict

from tglib.clients import KafkaConsumer
from tglib import ClientType, init


async def main(config: Dict) -> None:
    """Get the Kafka consumer client and print messages from the topics list."""
    consumer = KafkaConsumer().consumer
    consumer.subscribe(config["topics"])

    async for msg in consumer:
        print(
            "{}:{:d}:{:d}: key={} value={} timestamp_ms={}".format(
                msg.topic, msg.partition, msg.offset, msg.key, msg.value, msg.timestamp
            )
        )


if __name__ == "__main__":
    """Pass in the 'main' function and a set of clients into 'init'."""
    try:
        with open("./service_config.json") as f:
            config = json.load(f)
    except OSError:
        logging.exception("Failed to parse service configuration file")
        sys.exit(1)

    init(lambda: main(config), {ClientType.KAFKA_CONSUMER})
