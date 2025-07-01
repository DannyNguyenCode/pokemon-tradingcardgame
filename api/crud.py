
from sqlalchemy.orm import Session
from sqlalchemy import select,update,insert,delete
from api.models import Card


def create_card(db:Session,**kwargs)->Card:
    stmt=(
        insert(Card).values(kwargs).returning(Card)
    )
    result = db.execute(stmt).scalars().first()
    db.commit()
    return result

def list_cards(db:Session):
    stmt=(
        select(Card)
    )
    return db.execute(stmt).scalars().all()

def get_card_by_id(db:Session, id:int):
    stmt=(select(Card).where(Card.id == id))
    return db.execute(stmt).scalar_one_or_none()

def update_card(db:Session,id:int,**kwargs):
    stmt=(update(Card).where(Card.id ==id).values(**kwargs).returning(Card))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result

def delete_card(db:Session,id:int):
    stmt=(delete(Card).where(Card.id == id).returning(Card))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result