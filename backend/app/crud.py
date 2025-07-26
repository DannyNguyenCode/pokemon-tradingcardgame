
from sqlalchemy.orm import Session
from sqlalchemy import select, update, insert, delete, func
from app.models import Card, User, GoogleUser, LinkGoogle, Deck, DeckCard
import uuid


def create_card(db: Session, **kwargs) -> Card:
    stmt = (
        insert(Card).values(kwargs).returning(Card)
    )
    result = db.execute(stmt).scalars().first()
    db.commit()
    return result


def list_cards(db: Session, page: int, type_filter: str | None, pokemon_name: str | None, count_per_page: int = 12):
    filters = []
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
    result = db.execute(stmt).scalar_one_or_none()
    return result


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


def create_deck(db: Session, **kwargs):
    stmt = (insert(Deck).values(kwargs).returning(Deck))
    result = db.execute(stmt).scalars().first()
    db.commit()
    return result


def get_deck_by_id(db: Session, id: uuid.UUID):
    stmt = (select(Deck).where(Deck.id == id))
    return db.execute(stmt).scalar_one_or_none()


def list_decks(db: Session, page: int, user_id: uuid.UUID, count_per_page: int = 12):
    try:
        # Ensure user_id is a UUID instance
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)
    except ValueError:
        raise ValueError("Invalid UUID format for user_id")
    filters = []
    print(f"Listing decks for user ID: {user_id} in crud")
    filters.append(Deck.user_id == user_id)
    print(f"Filters applied: {filters[0]}")
    count_stmt = select(func.count(Deck.id).filter(*filters))
    total_count = db.execute(count_stmt).scalar()
    stmt = (select(Deck).where(Deck.user_id == user_id).order_by(
        Deck.created_at.desc()).limit(count_per_page).offset((page-1)*count_per_page))
    result = db.execute(stmt).scalars().all()

    return result, total_count


def update_deck(db: Session, id: uuid.UUID, **kwargs):
    stmt = (update(Deck).where(Deck.id == id).values(kwargs).returning(Deck))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def delete_deck(db: Session, id: uuid.UUID):
    stmt = (delete(Deck).where(Deck.id == id).returning(Deck))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def add_deck_card(db: Session, deck_id: uuid.UUID, card_id: uuid.UUID):
    stmt = (insert(DeckCard).values(deck_id=deck_id,
            card_id=card_id).returning(DeckCard))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def get_deck_card_by_id(db: Session, deck_id: uuid.UUID, card_id: uuid.UUID):
    stmt = (select(DeckCard).where(DeckCard.deck_id ==
            deck_id, DeckCard.card_id == card_id))
    return db.execute(stmt).scalar_one_or_none()


def list_deck_cards(db: Session, deck_id: uuid.UUID, page: int = 1, ):
    count_per_page = 12
    count_stmt = select(func.count(DeckCard.deck_id).filter(
        DeckCard.deck_id == deck_id))
    total_count = db.execute(count_stmt).scalar()
    stmt = (select(DeckCard).where(DeckCard.deck_id == deck_id).order_by(
        DeckCard.card_id.desc()).limit(count_per_page).offset((page-1)*count_per_page))
    result = db.execute(stmt).scalars().all()
    return result, total_count


def update_deck_card(db: Session, deck_id: uuid.UUID, card_id: uuid.UUID, **kwargs):
    stmt = (update(DeckCard).where(DeckCard.deck_id == deck_id,
            DeckCard.card_id == card_id).values(kwargs).returning(DeckCard))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def delete_deck_card(db: Session, deck_id: uuid.UUID, card_id: uuid.UUID):
    stmt = (delete(DeckCard).where(DeckCard.deck_id == deck_id,
            DeckCard.card_id == card_id).returning(DeckCard))
    result = db.execute(stmt).scalar_one_or_none()
    db.commit()
    return result


def replace_deck_cards(db: Session, deck_id: uuid.UUID, card_ids: list[uuid.UUID]):
    # Delete all existing cards for this deck
    delete_stmt = (
        delete(DeckCard)
        .where(DeckCard.deck_id == deck_id)
        .returning(DeckCard)
    )
    db.execute(delete_stmt)

    # Insert new cards if card_ids list is not empty
    if card_ids:
        insert_stmt = insert(DeckCard).values([
            {"deck_id": deck_id, "card_id": card_id} for card_id in card_ids
        ]).returning(DeckCard)
        db.execute(insert_stmt)
    db.commit()

    # Re-query to load full DeckCard + joined Card data
    stmt = (
        select(DeckCard)
        .where(DeckCard.deck_id == deck_id)
        .order_by(DeckCard.card_id)
    )
    result = db.execute(stmt).scalars().all()
    return result
