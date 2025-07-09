# models.py
import uuid
from datetime import datetime
from sqlalchemy import Integer, Text, DateTime, JSON, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column,relationship
from api.db import Base
from typing import List
from sqlalchemy import ForeignKey

class User(Base):
    __tablename__='user'
    id:Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
        index=True,
    )
    created_at:Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()")
    )
    pokemon_collection:Mapped[List["Pokemon_Collection"]] =relationship(back_populates="user", cascade="all, delete-orphan")
    email:Mapped[str]=mapped_column(Text,nullable=False)
    password:Mapped[str]=mapped_column(Text,nullable=False)

    def to_dict(self):
        return{
            "id":self.id,
            "created_at":self.created_at,
            "pokemon_collection":[pokemon.to_dict() for pokemon in self.pokemon_collection],
            "email":self.email,
        }
class Pokemon_Collection(Base):
    __tablename__='pokemon_collection'
    user_id:Mapped[uuid.UUID] =mapped_column(UUID(as_uuid=True),ForeignKey("user.id",ondelete="CASCADE"), primary_key=True)
    user:Mapped["User"]=relationship(back_populates='pokemon_collection')
    card_id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey("card.id",ondelete="CASCADE"), primary_key=True)
    card:Mapped["Card"] = relationship(back_populates='pokemon_collection')
    def to_dict(self):
        return{
            "user_id":self.user_id,
            "card_id":self.card_id,
            "card":self.card.to_dict() if self.card else {}
        }


class Card(Base):
    __tablename__ = "card" 

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()")
    )
    name: Mapped[str]= mapped_column(Text, nullable=True)
    rarity: Mapped[str]= mapped_column(Text, nullable=True)
    type: Mapped[str]= mapped_column(Text, nullable=True)
    hp: Mapped[int]= mapped_column(Integer, nullable=True)
    set_code: Mapped[str]= mapped_column(Text, nullable=True)
    collector_number: Mapped[str] = mapped_column(Text, nullable=True)
    description: Mapped[str]= mapped_column(Text, nullable=True)
    attack_1_name: Mapped[str]= mapped_column(Text, nullable=True)
    attack_1_dmg: Mapped[int]= mapped_column(Integer, nullable=True)
    attack_1_cost: Mapped[str]= mapped_column(Text, nullable=True)
    attack_2_name: Mapped[str]= mapped_column(Text, nullable=True)
    attack_2_dmg: Mapped[int]= mapped_column(Integer, nullable=True)
    attack_2_cost: Mapped[str]= mapped_column(Text, nullable=True)
    weakness: Mapped[list]= mapped_column(JSON, nullable=True)
    resistance: Mapped[list]= mapped_column(JSON, nullable=True)
    retreat_cost: Mapped[int]= mapped_column(Integer, nullable=True)
    image_url: Mapped[str]= mapped_column(Text, nullable=True)
    pokemon_collection:Mapped[List["Pokemon_Collection"]]=relationship(back_populates="card", cascade="all, delete-orphan")

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
