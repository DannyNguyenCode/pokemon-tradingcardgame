from marshmallow import Schema, fields
from marshmallow.validate import Length, Regexp

# Password validation regex (matches frontend - requires 2 uppercase, 2 numbers, 2 special)
PASSWORD_REGEX = r"^(?=.*[A-Z].*[A-Z])(?=.*[a-z])(?=.*\d.*\d)(?=.*[@$!%*?&].*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"


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
    collector_number = fields.Int()
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


class PaginationSchema(Schema):
    page = fields.Int(dump_only=True)
    page_size = fields.Int(dump_only=True)
    total_count = fields.Int(dump_only=True)
    total_pages = fields.Int(dump_only=True)
    has_next = fields.Bool(dump_only=True)
    has_prev = fields.Bool(dump_only=True)

    class Meta:
        title = "Pagination"


class PaginatedCardResponse(Schema):
    data = fields.List(fields.Nested(CardOut))
    pagination = fields.Nested(PaginationSchema)

    class Meta:
        title = "PaginatedCardResponse"


class CookiesTheme(Schema):
    theme = fields.Str()


class User(Schema):
    id = fields.UUID(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    role = fields.Str(load_default="user")
    email = fields.Email(required=True)
    password = fields.Str(
        required=True,
        load_only=True,
        validate=[
            Length(min=8, max=128,
                   error="Password must be between 8 and 128 characters"),
            Regexp(
                PASSWORD_REGEX,
                error="Password must contain at least 2 uppercase letters, 2 numbers, and 2 special characters (@$!%*?&)"
            )
        ]
    )
    decks = fields.List(fields.Nested("DeckSchema"), dump_only=True)


class GoogleAuthUser(Schema):
    email = fields.Email(required=True)
    name = fields.Str(required=True)
    picture = fields.Str(required=True)
    created_at = fields.DateTime(required=True)
    id = fields.Str(required=True)
    email_verified = fields.Bool(required=True)
    updated_at = fields.DateTime(required=True)


class Pokemon_Collection(Schema):
    user_id = fields.UUID(required=True)
    card_id = fields.UUID(required=True)
    card = fields.Nested(CardOut, dump_only=True)


class LoginSchema(Schema):
    email = fields.Email(required=True, load_only=True)
    password = fields.Str(required=True, load_only=True,
                          validate=Length(min=8))


class PageArgs(Schema):
    page = fields.Int(load_default=1)
    type_filter = fields.Str(required=False, load_only=True, load_default="")
    pokemon_name = fields.Str(required=False, load_only=True, load_default="")

    class Meta:
        title = "PageArgs"


class DeckSchema(Schema):
    id = fields.UUID(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    name = fields.Str(required=True, validate=Length(min=1, max=100))
    user_id = fields.UUID(required=True)
    # cards comes from DeckCard relationship
    cards = fields.List(fields.Nested(CardOut), dump_only=True)

    class Meta:
        title = "DeckSchema"


class DeckIn(DeckSchema):
    class Meta:
        title = "DeckIn"


class DeckUpdate(DeckIn):
    class Meta:
        title = "DeckUpdate"


class DeckOut(DeckSchema):
    class Meta:
        title = "DeckOut"


class DeckCardCreateSchema(Schema):
    deck_id = fields.UUID(required=True)
    card_id = fields.UUID(required=True)

    class Meta:
        title = "DeckCardCreateSchema"


class DeckCardIn(DeckCardCreateSchema):
    class Meta:
        title = "DeckCardIn"


class DeckCardOut(DeckCardCreateSchema):
    class Meta:
        title = "DeckCardOut"


class CardDeckResponseSchema(Schema):
    deck_id = fields.UUID(required=True)
    card_id = fields.UUID(required=True)
    card = fields.Nested(CardOut, dump_only=True)

    class Meta:
        title = "CardDeckResponseSchema"
