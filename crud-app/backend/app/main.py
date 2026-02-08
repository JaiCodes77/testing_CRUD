from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from .database import create_db_and_tables, get_session
from .models import Item, ItemCreate, ItemUpdate
 

app = FastAPI(title="FastAPI CRUD Starter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup()-> None:
    create_db_and_tables() 

def get_db():
    session = get_session()
    try:
        yield session 
    finally:
        session.close() 


#for basic health check 
@app.get('/', tags=["Root"])
def read_root():
    return {"message" : "CRUD app started!"}


#creating an item and updating it in the database 
@app.post("/items", response_model=Item, status_code=status.HTTP_201_CREATED) 
def create_item(payload:ItemCreate, session=Depends(get_db)):
     item = Item.model_validate(payload)
     session.add(item)
     session.commit()
     session.refresh(item)
     return item


#returing list of items 
@app.get("/items", response_model=List[Item])
def list_items(session=Depends(get_db)):
    items = session.exec(select(Item)).all()
    return items


#return one item 
@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id:int, session=Depends(get_db)):
    item = session.get(Item,item_id)
    if not item:
        raise HTTPException(status_code=404, detail="item not found!")
    return item 


#update item
@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: int, payload: ItemUpdate, session=Depends(get_db)):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(item, key, value)

    session.add(item)
    session.commit()
    session.refresh(item)
    return item 


#delete item 
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, session=Depends(get_db)):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    session.delete(item)
    session.commit()
    return None



