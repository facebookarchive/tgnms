"""update network test types

Revision ID: 0005
Revises: 0004
Create Date: 2020-09-24 13:36:22.229301

"""
import sqlalchemy as sa
from alembic import op
from network_test.models import NetworkTestParams


# revision identifiers, used by Alembic.
revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


old_types = ["MULTIHOP", "PARALLEL", "SEQUENTIAL"]
new_types = ["PARALLEL_LINK", "PARALLEL_NODE", "SEQUENTIAL_LINK", "SEQUENTIAL_NODE"]


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "network_test_params",
        "test_type",
        existing_type=sa.Enum(*old_types),
        type_=sa.Enum(*[*new_types, *old_types]),
        existing_nullable=False,
    )

    connection = op.get_bind()
    connection.execute(
        sa.update(NetworkTestParams)
        .where(NetworkTestParams.test_type == "MULTIHOP")
        .values(test_type="SEQUENTIAL_NODE")
    )
    connection.execute(
        sa.update(NetworkTestParams)
        .where(NetworkTestParams.test_type == "PARALLEL")
        .values(test_type="PARALLEL_LINK")
    )
    connection.execute(
        sa.update(NetworkTestParams)
        .where(NetworkTestParams.test_type == "SEQUENTIAL")
        .values(test_type="SEQUENTIAL_LINK")
    )

    op.alter_column(
        "network_test_params",
        "test_type",
        existing_type=sa.Enum(*[*new_types, *old_types]),
        type_=sa.Enum(*new_types),
        existing_nullable=False,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "network_test_params",
        "test_type",
        existing_type=sa.Enum(*new_types),
        type_=sa.Enum(*[*new_types, *old_types]),
        existing_nullable=False,
    )

    connection = op.get_bind()
    connection.execute(
        sa.update(NetworkTestParams)
        .where(NetworkTestParams.test_type == "SEQUENTIAL_NODE")
        .values(test_type="MULTIHOP")
    )
    connection.execute(
        sa.update(NetworkTestParams)
        .where(NetworkTestParams.test_type == "PARALLEL_LINK")
        .values(test_type="PARALLEL")
    )
    connection.execute(
        sa.update(NetworkTestParams)
        .where(NetworkTestParams.test_type == "SEQUENTIAL_LINK")
        .values(test_type="SEQUENTIAL")
    )
    connection.execute(
        sa.delete(NetworkTestParams).where(
            NetworkTestParams.test_type == "PARALLEL_NODE"
        )
    )

    op.alter_column(
        "network_test_params",
        "test_type",
        existing_type=sa.Enum(*[*new_types, *old_types]),
        type_=sa.Enum(*old_types),
        existing_nullable=False,
    )
    # ### end Alembic commands ###
