from marshmallow import Schema, fields

class AttackSchema(Schema):
    name   = fields.Str(dump_only=True, allow_none=True)
    damage = fields.Int(dump_only=True, allow_none=True)
    cost   = fields.Str(dump_only=True, allow_none=True)
class CardBase(Schema):
    __tablename__='card'
    id = fields.Str(dump_only=True)
    name=fields.Str()
    rarity=fields.Str()
    type=fields.Str()
    hp=fields.Int()
    set_code=fields.Str()
    collector_number=fields.Str()
    description=fields.Str()
    attacks= fields.List(fields.Nested(AttackSchema), dump_only=True)
    weakness= fields.List(fields.Str(), required=False, load_default=[])
    resistance= fields.List(fields.Str(), required=False, load_default=[])
    retreat_cost=fields.Int()
    image_url=fields.Str()
    created_at = fields.DateTime(dump_only=True)


class CardIn(CardBase):
    """Payload for creates / updates (no id/created_at)."""

    class Meta:
        title = "CardInput"

class CardOut(CardBase):
    """Representation returned by the API."""

    attacks = fields.List(fields.Nested(AttackSchema))

    class Meta:
        title = "Card"
    
class CardUpdate(CardIn):
    """Schema used for PUT/PATCH bodies."""

    class Meta:
        title = "CardUpdate"   # unique OpenAPI name