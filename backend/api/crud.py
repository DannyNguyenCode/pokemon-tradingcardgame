
from sqlalchemy.orm import Session
from sqlalchemy import select, update, insert, delete, func
from api.models import Card, User


def create_card(db: Session, **kwargs) -> Card:
    stmt = (
        insert(Card).values(kwargs).returning(Card)
    )
    result = db.execute(stmt).scalars().first()
    db.commit()
    return result


def list_cards(db: Session, page: int):
    count_per_page = 6
    count_stmt = select(func.count(Card.id))
    total_count = db.execute(count_stmt).scalar()
    stmt = (
        select(Card).order_by(Card.collector_number.asc()).limit(
            count_per_page).offset((page-1)*count_per_page)
    )
    result = db.execute(stmt).scalars().all()
    return result, total_count


def get_card_by_id(db: Session, id: int):
    stmt = (select(Card).where(Card.id == id))
    return db.execute(stmt).scalar_one_or_none()


def update_card(db: Session, id: int, **kwargs):
    stmt = (update(Card).where(Card.id == id).values(**kwargs).returning(Card))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def delete_card(db: Session, id: int):
    stmt = (delete(Card).where(Card.id == id).returning(Card))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def create_user(db: Session, **kwargs) -> User:
    stmt = (insert(User).values(kwargs).returning(User))
    result = db.execute(stmt).scalars().first()
    db.commit()
    return result


def get_user_by_id(db: Session, id: int):
    stmt = (select(User).where(User.id == id))
    return db.execute(stmt).scalar_one_or_none()


def user_list(db: Session):
    stmt = (select(User))
    return db.execute(stmt).scalars().all()


def update_user(db: Session, id: int, **kwargs):
    stmt = (update(User).where(User.id == id).values(kwargs).returning(User))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def delete_user(db: Session, id: int):
    stmt = (delete(User).where(User.id == id).returning(User))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def get_user_by_email(db: Session, email: str):
    stmt = (select(User).where(User.email == email))
    return db.execute(stmt).scalar_one_or_none()
