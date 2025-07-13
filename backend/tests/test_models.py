"""
Test-specific models with SQLite-compatible UUID generation.
These models override the production models to avoid PostgreSQL-specific functions.
"""

__test__ = False  # Prevent pytest from collecting this file as a test

import uuid
from datetime import datetime
from sqlalchemy import Integer, Text, DateTime, JSON, text, String
from sqlalchemy.orm import Mapped, mapped_column, relationship, declarative_base
from typing import List
from sqlalchemy import ForeignKey

TestBase = declarative_base()


class TestUser(TestBase):
    __tablename__ = 'test_user'
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )
    pokemon_collection: Mapped[List["TestPokemon_Collection"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")
    email: Mapped[str] = mapped_column(Text, nullable=False)
    password: Mapped[str] = mapped_column(Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at,
            "pokemon_collection": [pokemon.to_dict() for pokemon in self.pokemon_collection],
            "email": self.email,
        }


class TestPokemon_Collection(TestBase):
    __tablename__ = 'test_pokemon_collection'
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey(
        "test_user.id", ondelete="CASCADE"), primary_key=True)
    user: Mapped["TestUser"] = relationship(
        back_populates='pokemon_collection')
    card_id: Mapped[str] = mapped_column(String(36), ForeignKey(
        "test_card.id", ondelete="CASCADE"), primary_key=True)
    card: Mapped["TestCard"] = relationship(
        back_populates='pokemon_collection')

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "card_id": self.card_id,
            "card": self.card.to_dict() if self.card else {}
        }


class TestCard(TestBase):
    __tablename__ = "test_card"
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )
    name: Mapped[str] = mapped_column(Text, nullable=True)
    rarity: Mapped[str] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(Text, nullable=True)
    hp: Mapped[int] = mapped_column(Integer, nullable=True)
    set_code: Mapped[str] = mapped_column(Text, nullable=True)
    collector_number: Mapped[int] = mapped_column(Integer, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    attack_1_name: Mapped[str] = mapped_column(Text, nullable=True)
    attack_1_dmg: Mapped[int] = mapped_column(Integer, nullable=True)
    attack_1_cost: Mapped[str] = mapped_column(Text, nullable=True)
    attack_2_name: Mapped[str] = mapped_column(Text, nullable=True)
    attack_2_dmg: Mapped[int] = mapped_column(Integer, nullable=True)
    attack_2_cost: Mapped[str] = mapped_column(Text, nullable=True)
    weakness: Mapped[list] = mapped_column(JSON, nullable=True)
    resistance: Mapped[list] = mapped_column(JSON, nullable=True)
    retreat_cost: Mapped[int] = mapped_column(Integer, nullable=True)
    image_url: Mapped[str] = mapped_column(Text, nullable=True)
    pokemon_collection: Mapped[List["TestPokemon_Collection"]] = relationship(
        back_populates="card", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": str(self.id),
            "created_at": self.created_at,
            "name": self.name,
            "rarity": self.rarity,
            "type": self.type,
            "hp": self.hp,
            "set_code": self.set_code,
            "collector_number": self.collector_number,
            "description": self.description,
            "attacks": [
                {
                    "name": self.attack_1_name,
                    "damage": self.attack_1_dmg,
                    "cost": self.attack_1_cost,
                },
                {
                    "name": self.attack_2_name,
                    "damage": self.attack_2_dmg,
                    "cost": self.attack_2_cost,
                },
            ],
            "weakness": self.weakness or [],
            "resistance": self.resistance or [],
            "retreat_cost": self.retreat_cost,
            "image_url": self.image_url,
        }
