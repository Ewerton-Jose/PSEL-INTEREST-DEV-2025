from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from pydantic import BaseModel
from app.models import Time, User
from app.core.db import engine

router = APIRouter(prefix="/times", tags=["times"])


def get_session():
    """Dependency para obter sessão do banco de dados"""
    with Session(engine) as session:
        yield session


class TimeCreate(BaseModel):
    """Schema para criação de time"""
    id_time: int
    nome_time: str
    responsabilidades: str | None = None
    cpf_lider: str


class TimeUpdate(BaseModel):
    """Schema para atualização de time"""
    nome_time: str
    responsabilidades: str | None = None
    cpf_lider: str


class TimeResponse(BaseModel):
    """Schema de resposta de time"""
    id_time: int
    nome_time: str
    responsabilidades: str | None
    cpf_lider: str
    lider_nome: str | None = None
    total_membros: int = 0


@router.post("/", response_model=TimeResponse, status_code=201)
def criar_time(time_data: TimeCreate, session: Session = Depends(get_session)):
    """
    Cria um novo time.
    
    REGRAS:
    - Todo time DEVE ter um líder
    - O líder deve ser um usuário existente
    - Um usuário só pode ser líder de um time
    """
    # Verifica se já existe time com esse ID
    existing = session.get(Time, time_data.id_time)
    if existing:
        raise HTTPException(status_code=400, detail="Time com este ID já existe")
    
    # Verifica se já existe time com esse nome
    statement = select(Time).where(Time.nome_time == time_data.nome_time)
    existing_nome = session.exec(statement).first()
    if existing_nome:
        raise HTTPException(status_code=400, detail="Time com este nome já existe")
    
    # Verifica se o líder existe
    lider = session.get(User, time_data.cpf_lider)
    if not lider:
        raise HTTPException(status_code=404, detail="Líder não encontrado. CPF inválido.")
    
    # Verifica se o líder já lidera outro time
    statement = select(Time).where(Time.cpf_lider == time_data.cpf_lider)
    time_liderado = session.exec(statement).first()
    if time_liderado:
        raise HTTPException(
            status_code=400,
            detail=f"Este usuário já é líder do time '{time_liderado.nome_time}'. "
                   f"Um usuário só pode ser líder de um time."
        )
    
    # Cria o time
    time = Time(
        id_time=time_data.id_time,
        nome_time=time_data.nome_time,
        responsabilidades=time_data.responsabilidades,
        cpf_lider=time_data.cpf_lider
    )
    
    session.add(time)
    session.commit()
    session.refresh(time)
    
    # Conta membros
    statement = select(User).where(User.id_time == time.id_time)
    membros = session.exec(statement).all()
    
    return TimeResponse(
        id_time=time.id_time,
        nome_time=time.nome_time,
        responsabilidades=time.responsabilidades,
        cpf_lider=time.cpf_lider,
        lider_nome=lider.nome,
        total_membros=len(membros)
    )


@router.get("/", response_model=List[TimeResponse])
def listar_times(session: Session = Depends(get_session)):
    """Lista todos os times com informações do líder"""
    statement = select(Time)
    times = session.exec(statement).all()
    
    result = []
    for time in times:
        lider = session.get(User, time.cpf_lider)
        statement = select(User).where(User.id_time == time.id_time)
        membros = session.exec(statement).all()
        
        result.append(TimeResponse(
            id_time=time.id_time,
            nome_time=time.nome_time,
            responsabilidades=time.responsabilidades,
            cpf_lider=time.cpf_lider,
            lider_nome=lider.nome if lider else None,
            total_membros=len(membros)
        ))
    
    return result


@router.get("/{id_time}", response_model=TimeResponse)
def obter_time(id_time: int, session: Session = Depends(get_session)):
    """Obtém um time específico por ID"""
    time = session.get(Time, id_time)
    if not time:
        raise HTTPException(status_code=404, detail="Time não encontrado")
    
    lider = session.get(User, time.cpf_lider)
    statement = select(User).where(User.id_time == time.id_time)
    membros = session.exec(statement).all()
    
    return TimeResponse(
        id_time=time.id_time,
        nome_time=time.nome_time,
        responsabilidades=time.responsabilidades,
        cpf_lider=time.cpf_lider,
        lider_nome=lider.nome if lider else None,
        total_membros=len(membros)
    )


@router.put("/{id_time}", response_model=TimeResponse)
def atualizar_time(id_time: int, time_update: TimeUpdate, session: Session = Depends(get_session)):
    """
    Atualiza um time existente.
    
    REGRAS:
    - O novo líder deve existir
    - O novo líder não pode já ser líder de outro time
    """
    time = session.get(Time, id_time)
    if not time:
        raise HTTPException(status_code=404, detail="Time não encontrado")
    
    # Verifica se o nome já está em uso por outro time
    if time_update.nome_time != time.nome_time:
        statement = select(Time).where(Time.nome_time == time_update.nome_time)
        existing_nome = session.exec(statement).first()
        if existing_nome:
            raise HTTPException(status_code=400, detail="Time com este nome já existe")
    
    # Verifica se o líder foi alterado
    if time_update.cpf_lider != time.cpf_lider:
        # Verifica se o novo líder existe
        novo_lider = session.get(User, time_update.cpf_lider)
        if not novo_lider:
            raise HTTPException(status_code=404, detail="Novo líder não encontrado. CPF inválido.")
        
        # Verifica se o novo líder já lidera outro time
        statement = select(Time).where(
            Time.cpf_lider == time_update.cpf_lider,
            Time.id_time != id_time
        )
        time_liderado = session.exec(statement).first()
        if time_liderado:
            raise HTTPException(
                status_code=400,
                detail=f"Este usuário já é líder do time '{time_liderado.nome_time}'. "
                       f"Um usuário só pode ser líder de um time."
            )
    
    # Atualiza o time
    time.nome_time = time_update.nome_time
    time.responsabilidades = time_update.responsabilidades
    time.cpf_lider = time_update.cpf_lider
    
    session.add(time)
    session.commit()
    session.refresh(time)
    
    lider = session.get(User, time.cpf_lider)
    statement = select(User).where(User.id_time == time.id_time)
    membros = session.exec(statement).all()
    
    return TimeResponse(
        id_time=time.id_time,
        nome_time=time.nome_time,
        responsabilidades=time.responsabilidades,
        cpf_lider=time.cpf_lider,
        lider_nome=lider.nome if lider else None,
        total_membros=len(membros)
    )


@router.delete("/{id_time}", status_code=204)
def deletar_time(id_time: int, session: Session = Depends(get_session)):
    """
    Deleta um time.
    
    ATENÇÃO: Ao deletar um time, todos os usuários perdem a referência ao time (id_time = NULL).
    """
    time = session.get(Time, id_time)
    if not time:
        raise HTTPException(status_code=404, detail="Time não encontrado")
    
    # Remove a referência do time de todos os membros
    statement = select(User).where(User.id_time == id_time)
    membros = session.exec(statement).all()
    for membro in membros:
        membro.id_time = None
        session.add(membro)
    
    session.delete(time)
    session.commit()
    return None


@router.get("/{id_time}/membros", response_model=List[dict])
def listar_membros_do_time(id_time: int, session: Session = Depends(get_session)):
    """
    Lista todos os membros de um time específico.
    Indica quem é o líder.
    """
    time = session.get(Time, id_time)
    if not time:
        raise HTTPException(status_code=404, detail="Time não encontrado")
    
    statement = select(User).where(User.id_time == id_time)
    usuarios = session.exec(statement).all()
    
    result = []
    for user in usuarios:
        result.append({
            "cpf_user": user.cpf_user,
            "nome": user.nome,
            "funcao": user.funcao,
            "is_lider": user.cpf_user == time.cpf_lider
        })
    
    return result
