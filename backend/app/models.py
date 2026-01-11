from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

# Arquivo base para criação de todos os modelos necessários
# Serve como base para User e Team models
# Através dele a exportação para o alembic deve ser executada


class User(SQLModel, table=True):
    """
    Tabela de usuários.
    REGRA: Um usuário só pode pertencer a um time por vez.
    """
    __tablename__ = "users"
    
    cpf_user: str = Field(primary_key=True, max_length=11)
    nome: str = Field(max_length=100)
    funcao: str = Field(max_length=100)
    id_time: Optional[int] = Field(default=None, foreign_key="times.id_time")
    # Flag para indicar se já foi líder (ex-líder)
    ex_lider: bool = Field(default=False)
    
    # Relacionamento com time
    time: Optional["Time"] = Relationship(
        back_populates="membros",
        sa_relationship_kwargs={"foreign_keys": "[User.id_time]"}
    )
    
    # Relacionamento para time liderado (se for líder)
    time_liderado: Optional["Time"] = Relationship(
        back_populates="lider",
        sa_relationship_kwargs={"foreign_keys": "[Time.cpf_lider]"}
    )


class Time(SQLModel, table=True):
    """
    Tabela de times.
    REGRAS:
    - Todo time DEVE ter um líder (obrigatório)
    - Um usuário só pode ser líder de um único time
    """
    __tablename__ = "times"
    
    id_time: int = Field(primary_key=True)
    nome_time: str = Field(max_length=100, unique=True)
    responsabilidades: Optional[str] = Field(default=None, max_length=500)
    
    # CPF do líder - OBRIGATÓRIO
    cpf_lider: str = Field(
        foreign_key="users.cpf_user",
        unique=True,  # Garante que um usuário só pode ser líder de um time
        max_length=11
    )
    
    # Relacionamento com líder
    lider: "User" = Relationship(
        back_populates="time_liderado",
        sa_relationship_kwargs={"foreign_keys": "[Time.cpf_lider]"}
    )
    
    # Relacionamento com membros do time
    membros: list["User"] = Relationship(
        back_populates="time",
        sa_relationship_kwargs={"foreign_keys": "[User.id_time]"}
    )
