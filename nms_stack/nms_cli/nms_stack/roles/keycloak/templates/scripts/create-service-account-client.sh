#!/bin/bash

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

function usage {
  echo "usage: create-service-account-client.sh <oauth client-id> <env file path> <role1,role2>"
}

KCADMIN="/opt/jboss/keycloak/bin/kcadm.sh"

function generate_client {
  REALM=tgnms
  KEYCLOAK_HOST=http://keycloak_keycloak:8080
  CLIENT_ID=$1
  ENV_FILE=$2
  ROLES=$3

  if [ -z "$CLIENT_ID" ] || [ -z "$ENV_FILE" ]
  then
    usage && exit 1
  fi

  # shellcheck disable=SC1091
  $KCADMIN config credentials --server $KEYCLOAK_HOST/auth --realm master --user "$KEYCLOAK_USER" --password "$KEYCLOAK_PASSWORD"

  echo "generating keycloak client: $CLIENT_ID"

  echo "> querying primary key"
  # cache the primary key of client (not the OAuth client-id)
  ID=$($KCADMIN get clients -r $REALM -q clientId="$CLIENT_ID" | jq -r '.[0].id')
  if [ -z "$ID" ] || [ "$ID" == "null" ];
  then
    $KCADMIN create clients -r $REALM -f - <<EOF
    {
      "clientId": "$CLIENT_ID",
      "enabled": true,
      "serviceAccountsEnabled": true,
      "standardFlowEnabled": true,
      "clientAuthenticatorType": "client-secret",
      "directAccessGrantsEnabled": false,
      "protocol": "openid-connect",
      "publicClient": false
    }
EOF
    ID=$($KCADMIN get clients -r $REALM -q clientId="$CLIENT_ID" | jq -r '.[0].id')
    if [ -z "$ID" ] || [ "$ID" == "null" ];
    then
      echo -e "\e[31mERROR: could not load primary key of client: $CLIENT_ID\e[0m" && exit 1
    fi
  fi

  echo "> querying client secret"
  SECRET=$($KCADMIN get "clients/$ID/client-secret" -r $REALM | jq -r '.value')
  # If secret is null, generate it
  # This normally only happens with imported clients, not scripted clients
  if [ -z "$SECRET" ] || [ "$SECRET" == "null" ];
  then
    echo "> generating client secret"
    # generate the client secret
    $KCADMIN create "clients/$ID/client-secret" -r $REALM
    # query the new client secret
    SECRET=$($KCADMIN get "clients/$ID/client-secret" -r $REALM | jq -r '.value')
  fi

  echo "> writing out env file: $ENV_FILE"
  # generate the env file
  {
    echo "KEYCLOAK_HOST=$KEYCLOAK_HOST"
    echo "KEYCLOAK_CLIENT_ID=$CLIENT_ID"
    echo "KEYCLOAK_REALM=$REALM"
    echo "KEYCLOAK_CLIENT_SECRET=$SECRET"
  } > "$ENV_FILE"

  echo -e "\e[32mfinished generating keycloak client: $CLIENT_ID\e[0m\n"
  echo "assigning service account roles to client: $CLIENT_ID"

  SERVICE_ACCOUNT_ID=$($KCADMIN get -r $REALM clients/$ID/service-account-user | jq -r '.id')
  for ROLE in $(echo $ROLES | sed "s/,/ /g")
  do
    SERVICE_ACCOUNT_ROLE_ID=$($KCADMIN get -r $REALM roles | jq -r --arg ROLE "$ROLE" '.[] | select(.name == $ROLE) | .id')
    $KCADMIN create -r $REALM users/$SERVICE_ACCOUNT_ID/role-mappings/realm -f - <<EOF
    [{
      "clientRole":false,
      "containerId":"$REALM",
      "id":"$SERVICE_ACCOUNT_ROLE_ID",
      "name":"$ROLE"
    }]
EOF
  done
  echo "> creating mapper"
  # create mapper role
  $KCADMIN create "clients/$ID/protocol-mappers/models" -r $REALM -f - <<EOF
    {
      "name": "realm_roles",
      "protocol": "openid-connect",
      "protocolMapper": "oidc-usermodel-realm-role-mapper",
      "consentRequired": false,
      "config": {
       "multivalued": "true",
       "userinfo.token.claim": "true",
       "id.token.claim": "true",
       "access.token.claim": "true",
       "claim.name": "roles",
       "jsonType.label": "String"
      }
    }
EOF
  # ignore errors from re-creating mapper
  echo "done"
}

generate_client "$1" "$2" "$3"
