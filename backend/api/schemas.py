from marshmallow import Schema, fields
from marshmallow.validate import Length, Regexp
import re

# Password validation regex (same as frontend)
PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"


class AttackSchema(Schema):
    name = fields.Str(dump_only=True, allow_none=True)
    damage = fields.Int(dump_only=True, allow_none=True)
    cost = fields.Str(dump_only=True, allow_none=True)


class CardBase(Schema):
    id = fields.Str(dump_only=True)
    name = fields.Str()
    rarity = fields.Str()
    type = fields.Str()
    hp = fields.Int()
    set_code = fields.Str()
    collector_number = fields.Str()
    description = fields.Str()
    attacks = fields.List(fields.Nested(AttackSchema), dump_only=True)
    weakness = fields.List(fields.Str(), required=False, load_default=[])
    resistance = fields.List(fields.Str(), required=False, load_default=[])
    retreat_cost = fields.Int()
    image_url = fields.Str()
    created_at = fields.DateTime(dump_only=True)


class CardIn(CardBase):
    class Meta:
        title = "CardInput"


class CardOut(CardBase):
    pass

    class Meta:
        title = "Card"


class CardUpdate(CardIn):
    class Meta:
        title = "CardUpdate"


class CookiesTheme(Schema):
    theme = fields.Str()


class User(Schema):
    id = fields.UUID(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    email = fields.Email(required=True)
    password = fields.Str(
        required=True,
        load_only=True,
        validate=[
            Length(min=8, max=128,
                   error="Password must be between 8 and 128 characters"),
            Regexp(
                PASSWORD_REGEX,
                error="Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
            )
        ]
    )


class Pokemon_Collection(Schema):
    user_id = fields.UUID(required=True)
    card_id = fields.UUID(required=True)
    card = fields.Nested(CardOut, dump_only=True)


class LoginSchema(Schema):
    email = fields.Email(required=True, load_only=True)
    password = fields.Str(required=True, load_only=True,
                          validate=Length(min=8))
