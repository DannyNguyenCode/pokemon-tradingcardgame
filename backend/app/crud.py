
from sqlalchemy.orm import Session
from sqlalchemy import select, update, insert, delete, func
from app.models import Card, User, GoogleUser, LinkGoogle


def create_card(db: Session, **kwargs) -> Card:
    stmt = (
        insert(Card).values(kwargs).returning(Card)
    )
    result = db.execute(stmt).scalars().first()
    db.commit()
    return result


def list_cards(db: Session, page: int, type_filter: str | None, pokemon_name: str | None):
    filters = []
    count_per_page = 12
    if type_filter:
        filters.append(Card.type == type_filter.capitalize())
    if pokemon_name:
        filters.append(Card.name.ilike(f"%{pokemon_name}%"))

    count_stmt = select(func.count(Card.id).filter(*filters))
    total_count = db.execute(count_stmt).scalar()
    stmt = (
        select(Card).where(*filters).order_by(Card.collector_number.asc()).limit(
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


def add_google_user(db: Session, **kwargs):
    stmt = (insert(GoogleUser).values(kwargs).returning(GoogleUser))
    result = db.execute(stmt).scalars().first()
    db.commit()
    return result


def get_google_user_by_email(db: Session, email: str):
    stmt = (select(GoogleUser).where(GoogleUser.email == email))
    return db.execute(stmt).scalar_one_or_none()


def get_google_user_by_id(db: Session, id: int):
    stmt = (select(GoogleUser).where(GoogleUser.id == id))
    return db.execute(stmt).scalar_one_or_none()


def update_google_user(db: Session, id: int, **kwargs):
    stmt = (update(GoogleUser).where(GoogleUser.id ==
            id).values(kwargs).returning(GoogleUser))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def delete_google_user(db: Session, id: int):
    stmt = (delete(GoogleUser).where(
        GoogleUser.id == id).returning(GoogleUser))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def add_link_google(db: Session, **kwargs):
    stmt = (insert(LinkGoogle).values(kwargs).returning(LinkGoogle))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def get_link_google_by_user_id(db: Session, user_id: int):
    stmt = (select(LinkGoogle).where(LinkGoogle.user_id == user_id))
    return db.execute(stmt).scalar_one_or_none()


def get_link_google_by_google_sub(db: Session, google_sub: int):
    stmt = (select(LinkGoogle).where(
        LinkGoogle.google_sub == google_sub))
    return db.execute(stmt).scalar_one_or_none()


def delete_link_google(db: Session, user_id: int):
    stmt = (delete(LinkGoogle).where(
        LinkGoogle.user_id == user_id).returning(LinkGoogle))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def delete_link_google_by_google_sub(db: Session, google_sub: int):
    stmt = (delete(LinkGoogle).where(
        LinkGoogle.google_sub == google_sub).returning(LinkGoogle))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def get_link_google_by_user_id_and_google_sub(db: Session, user_id: int, google_sub: int):
    stmt = (select(LinkGoogle).where(
        LinkGoogle.user_id == user_id, LinkGoogle.google_sub == google_sub))
    return db.execute(stmt).scalar_one_or_none()
