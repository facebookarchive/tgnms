# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

"""rename whitelist column

Revision ID: 0006
Revises: 0005
Create Date: 2020-11-05 20:51:05.949538

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "network_test_params",
        sa.Column("allowlist", sa.JSON(none_as_null=True), nullable=True),
    )
    op.drop_column("network_test_params", "whitelist")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "network_test_params",
        sa.Column("whitelist", sa.JSON(none_as_null=True), nullable=True),
    )
    op.drop_column("network_test_params", "allowlist")
    # ### end Alembic commands ###
