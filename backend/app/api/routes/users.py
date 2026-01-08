from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from pydantic import BaseModel
from app.models import User, Time
from app.core.db import engine

router = APIRouter(prefix="/users", tags=["users"])


def get_session():
    """Dependency para obter sessão do banco de dados"""
    with Session(engine) as session:
        yield session


class UserCreate(BaseModel):
    """Schema para criação de usuário"""
    cpf_user: str
    nome: str
    funcao: str
    id_time: int | None = None


class UserUpdate(BaseModel):
    """Schema para atualização de usuário"""
    nome: str
    funcao: str
    id_time: int | None = None


class UserResponse(BaseModel):
    """Schema de resposta de usuário"""
    cpf_user: str
    nome: str
    funcao: str
    id_time: int | None
    nome_time: str | None = None
    is_lider: bool = False


@router.post("/", response_model=UserResponse, status_code=201)
def criar_usuario(user_data: UserCreate, session: Session = Depends(get_session)):
    """
    Cria um novo usuário.
    
    REGRA: O usuário só pode pertencer a um time por vez.
    """
    # Verifica se já existe usuário com este CPF
    existing = session.get(User, user_data.cpf_user)
    if existing:
        raise HTTPException(status_code=400, detail="Usuário com este CPF já existe")
    
    # Se id_time foi fornecido, verifica se o time existe
    if user_data.id_time:
        time = session.get(Time, user_data.id_time)
        if not time:
            raise HTTPException(status_code=404, detail="Time não encontrado")
    
    # Cria o usuário
    user = User(
        cpf_user=user_data.cpf_user,
        nome=user_data.nome,
        funcao=user_data.funcao,
        id_time=user_data.id_time
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Prepara resposta
    nome_time = None
    is_lider = False
    if user.id_time:
        time = session.get(Time, user.id_time)
        if time:
            nome_time = time.nome_time
            is_lider = time.cpf_lider == user.cpf_user
    
    return UserResponse(
        cpf_user=user.cpf_user,
        nome=user.nome,
        funcao=user.funcao,
        id_time=user.id_time,
        nome_time=nome_time,
        is_lider=is_lider
    )


@router.get("/", response_model=List[UserResponse])
def listar_usuarios(session: Session = Depends(get_session)):
    """Lista todos os usuários com informações do time"""
    statement = select(User)
    users = session.exec(statement).all()
    
    result = []
    for user in users:
        nome_time = None
        is_lider = False
        if user.id_time:
            time = session.get(Time, user.id_time)
            if time:
                nome_time = time.nome_time
                is_lider = time.cpf_lider == user.cpf_user
        
        result.append(UserResponse(
            cpf_user=user.cpf_user,
            nome=user.nome,
            funcao=user.funcao,
            id_time=user.id_time,
            nome_time=nome_time,
            is_lider=is_lider
        ))
    
    return result


@router.get("/{cpf_user}", response_model=UserResponse)
def obter_usuario(cpf_user: str, session: Session = Depends(get_session)):
    """Obtém um usuário específico por CPF"""
    user = session.get(User, cpf_user)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    nome_time = None
    is_lider = False
    if user.id_time:
        time = session.get(Time, user.id_time)
        if time:
            nome_time = time.nome_time
            is_lider = time.cpf_lider == user.cpf_user
    
    return UserResponse(
        cpf_user=user.cpf_user,
        nome=user.nome,
        funcao=user.funcao,
        id_time=user.id_time,
        nome_time=nome_time,
        is_lider=is_lider
    )


@router.put("/{cpf_user}", response_model=UserResponse)
def atualizar_usuario(cpf_user: str, user_update: UserUpdate, session: Session = Depends(get_session)):
    """
    Atualiza um usuário existente.
    
    REGRA: Ao mudar de time, o usuário sai automaticamente do time anterior.
    """
    user = session.get(User, cpf_user)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Se id_time foi alterado, verifica se o novo time existe
    if user_update.id_time is not None and user_update.id_time != user.id_time:
        time = session.get(Time, user_update.id_time)
        if not time:
            raise HTTPException(status_code=404, detail="Time não encontrado")
    
    # Verifica se o usuário é líder do time atual
    if user.id_time:
        time_atual = session.get(Time, user.id_time)
        if time_atual and time_atual.cpf_lider == user.cpf_user:
            # Se está mudando de time ou saindo do time
            if user_update.id_time != user.id_time:
                raise HTTPException(
                    status_code=400,
                    detail=f"Este usuário é líder do time '{time_atual.nome_time}'. "
                           f"Não é possível remover o líder do time. "
                           f"Primeiro, atribua outro líder ao time."
                )
    
    user.nome = user_update.nome
    user.funcao = user_update.funcao
    user.id_time = user_update.id_time
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    nome_time = None
    is_lider = False
    if user.id_time:
        time = session.get(Time, user.id_time)
        if time:
            nome_time = time.nome_time
            is_lider = time.cpf_lider == user.cpf_user
    
    return UserResponse(
        cpf_user=user.cpf_user,
        nome=user.nome,
        funcao=user.funcao,
        id_time=user.id_time,
        nome_time=nome_time,
        is_lider=is_lider
    )


@router.delete("/{cpf_user}", status_code=204)
def deletar_usuario(cpf_user: str, session: Session = Depends(get_session)):
    """
    Deleta um usuário.
    
    ATENÇÃO: Não é possível deletar um usuário que é líder de um time.
    Primeiro, atribua outro líder ao time.
    """
    user = session.get(User, cpf_user)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Verifica se o usuário é líder de algum time
    statement = select(Time).where(Time.cpf_lider == cpf_user)
    time_liderado = session.exec(statement).first()
    if time_liderado:
        raise HTTPException(
            status_code=400,
            detail=f"Este usuário é líder do time '{time_liderado.nome_time}'. "
                   f"Não é possível deletar um líder. "
                   f"Primeiro, atribua outro líder ao time ou delete o time."
        )
    
    session.delete(user)
    session.commit()
    return None


@router.get("/lideres/lista", response_model=List[UserResponse])
def listar_lideres(session: Session = Depends(get_session)):
    """Lista todos os usuários que são líderes de times"""
    statement = select(Time)
    times = session.exec(statement).all()
    
    result = []
    for time in times:
        user = session.get(User, time.cpf_lider)
        if user:
            result.append(UserResponse(
                cpf_user=user.cpf_user,
                nome=user.nome,
                funcao=user.funcao,
                id_time=user.id_time,
                nome_time=time.nome_time,
                is_lider=True
            ))
    
    return result
