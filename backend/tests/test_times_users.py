"""
Testes básicos para as APIs de Times e Usuários.

Execute os testes com:
    make backend-shell
    pytest tests/test_times_users.py -v
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.core.db import engine as default_engine
from app.models import Time, User
from app.api.routes.times import get_session as get_times_session
from app.api.routes.users import get_session as get_users_session


# Criar engine em memória para testes
@pytest.fixture(name="session")
def session_fixture():
    """Fixture para criar sessão de teste em memória"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Fixture para criar cliente de teste com sessão mockada"""
    def get_session_override():
        return session
    
    app.dependency_overrides[get_times_session] = get_session_override
    app.dependency_overrides[get_users_session] = get_session_override
    
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


# ========== TESTES DE TIMES ==========

def test_criar_time(client: TestClient):
    """Testa criação de um novo time"""
    response = client.post(
        "/api/v1/times/",
        json={
            "id_time": 1,
            "nome_time": "Desenvolvimento",
            "responsabilidades": "Criar aplicações"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nome_time"] == "Desenvolvimento"
    assert data["id_time"] == 1


def test_criar_time_duplicado(client: TestClient):
    """Testa que não é possível criar time com ID duplicado"""
    # Criar primeiro time
    client.post(
        "/api/v1/times/",
        json={
            "id_time": 1,
            "nome_time": "Time 1",
            "responsabilidades": "Resp 1"
        }
    )
    
    # Tentar criar time com mesmo ID
    response = client.post(
        "/api/v1/times/",
        json={
            "id_time": 1,
            "nome_time": "Time 2",
            "responsabilidades": "Resp 2"
        }
    )
    assert response.status_code == 400
    assert "já existe" in response.json()["detail"]


def test_listar_times(client: TestClient):
    """Testa listagem de times"""
    # Criar times
    client.post("/api/v1/times/", json={"id_time": 1, "nome_time": "Time 1", "responsabilidades": "R1"})
    client.post("/api/v1/times/", json={"id_time": 2, "nome_time": "Time 2", "responsabilidades": "R2"})
    
    # Listar
    response = client.get("/api/v1/times/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["nome_time"] == "Time 1"
    assert data[1]["nome_time"] == "Time 2"


def test_obter_time_especifico(client: TestClient):
    """Testa obtenção de um time específico"""
    # Criar time
    client.post("/api/v1/times/", json={"id_time": 1, "nome_time": "Time 1", "responsabilidades": "R1"})
    
    # Obter time
    response = client.get("/api/v1/times/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id_time"] == 1
    assert data["nome_time"] == "Time 1"


def test_obter_time_inexistente(client: TestClient):
    """Testa que retorna 404 para time inexistente"""
    response = client.get("/api/v1/times/999")
    assert response.status_code == 404


def test_atualizar_time(client: TestClient):
    """Testa atualização de um time"""
    # Criar time
    client.post("/api/v1/times/", json={"id_time": 1, "nome_time": "Time Original", "responsabilidades": "R1"})
    
    # Atualizar time
    response = client.put(
        "/api/v1/times/1",
        json={
            "id_time": 1,
            "nome_time": "Time Atualizado",
            "responsabilidades": "Novas responsabilidades"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nome_time"] == "Time Atualizado"
    assert data["responsabilidades"] == "Novas responsabilidades"


def test_deletar_time(client: TestClient):
    """Testa deleção de um time"""
    # Criar time
    client.post("/api/v1/times/", json={"id_time": 1, "nome_time": "Time 1", "responsabilidades": "R1"})
    
    # Deletar time
    response = client.delete("/api/v1/times/1")
    assert response.status_code == 204
    
    # Verificar que foi deletado
    response = client.get("/api/v1/times/1")
    assert response.status_code == 404


# ========== TESTES DE USUÁRIOS ==========

def test_criar_usuario(client: TestClient):
    """Testa criação de um novo usuário"""
    # Criar time primeiro
    client.post("/api/v1/times/", json={"id_time": 1, "nome_time": "Dev", "responsabilidades": "R1"})
    
    # Criar usuário
    response = client.post(
        "/api/v1/users/",
        json={
            "cpf_user": "12345678901",
            "nome": "João Silva",
            "funcao": "Desenvolvedor",
            "id_time": 1
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nome"] == "João Silva"
    assert data["cpf_user"] == "12345678901"


def test_criar_usuario_sem_time(client: TestClient):
    """Testa criação de usuário sem time"""
    response = client.post(
        "/api/v1/users/",
        json={
            "cpf_user": "12345678901",
            "nome": "João Silva",
            "funcao": "Freelancer",
            "id_time": None
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id_time"] is None


def test_criar_usuario_time_inexistente(client: TestClient):
    """Testa que não é possível criar usuário com time inexistente"""
    response = client.post(
        "/api/v1/users/",
        json={
            "cpf_user": "12345678901",
            "nome": "João Silva",
            "funcao": "Desenvolvedor",
            "id_time": 999
        }
    )
    assert response.status_code == 404
    assert "Time não encontrado" in response.json()["detail"]


def test_criar_usuario_cpf_duplicado(client: TestClient):
    """Testa que não é possível criar usuário com CPF duplicado"""
    # Criar primeiro usuário
    client.post(
        "/api/v1/users/",
        json={
            "cpf_user": "12345678901",
            "nome": "João Silva",
            "funcao": "Dev",
            "id_time": None
        }
    )
    
    # Tentar criar usuário com mesmo CPF
    response = client.post(
        "/api/v1/users/",
        json={
            "cpf_user": "12345678901",
            "nome": "Maria Santos",
            "funcao": "Designer",
            "id_time": None
        }
    )
    assert response.status_code == 400
    assert "já existe" in response.json()["detail"]


def test_listar_usuarios(client: TestClient):
    """Testa listagem de usuários"""
    # Criar usuários
    client.post("/api/v1/users/", json={"cpf_user": "111", "nome": "User 1", "funcao": "F1", "id_time": None})
    client.post("/api/v1/users/", json={"cpf_user": "222", "nome": "User 2", "funcao": "F2", "id_time": None})
    
    # Listar
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_obter_usuario_especifico(client: TestClient):
    """Testa obtenção de um usuário específico"""
    # Criar usuário
    client.post("/api/v1/users/", json={"cpf_user": "12345678901", "nome": "João", "funcao": "Dev", "id_time": None})
    
    # Obter usuário
    response = client.get("/api/v1/users/12345678901")
    assert response.status_code == 200
    data = response.json()
    assert data["cpf_user"] == "12345678901"
    assert data["nome"] == "João"


def test_atualizar_usuario(client: TestClient):
    """Testa atualização de um usuário"""
    # Criar usuário
    client.post("/api/v1/users/", json={"cpf_user": "111", "nome": "João", "funcao": "Dev", "id_time": None})
    
    # Atualizar usuário
    response = client.put(
        "/api/v1/users/111",
        json={
            "cpf_user": "111",
            "nome": "João Silva",
            "funcao": "Tech Lead",
            "id_time": None
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nome"] == "João Silva"
    assert data["funcao"] == "Tech Lead"


def test_deletar_usuario(client: TestClient):
    """Testa deleção de um usuário"""
    # Criar usuário
    client.post("/api/v1/users/", json={"cpf_user": "111", "nome": "João", "funcao": "Dev", "id_time": None})
    
    # Deletar usuário
    response = client.delete("/api/v1/users/111")
    assert response.status_code == 204
    
    # Verificar que foi deletado
    response = client.get("/api/v1/users/111")
    assert response.status_code == 404


def test_listar_usuarios_do_time(client: TestClient):
    """Testa listagem de usuários de um time"""
    # Criar time
    client.post("/api/v1/times/", json={"id_time": 1, "nome_time": "Dev", "responsabilidades": "R1"})
    
    # Criar usuários
    client.post("/api/v1/users/", json={"cpf_user": "111", "nome": "User 1", "funcao": "F1", "id_time": 1})
    client.post("/api/v1/users/", json={"cpf_user": "222", "nome": "User 2", "funcao": "F2", "id_time": 1})
    client.post("/api/v1/users/", json={"cpf_user": "333", "nome": "User 3", "funcao": "F3", "id_time": None})
    
    # Listar usuários do time
    response = client.get("/api/v1/times/1/usuarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Apenas os usuários do time 1


def test_relacionamento_time_usuarios(client: TestClient):
    """Testa o relacionamento entre times e usuários"""
    # Criar time
    client.post("/api/v1/times/", json={"id_time": 1, "nome_time": "Dev", "responsabilidades": "R1"})
    
    # Criar usuário no time
    client.post("/api/v1/users/", json={"cpf_user": "111", "nome": "João", "funcao": "Dev", "id_time": 1})
    
    # Verificar relacionamento
    time_response = client.get("/api/v1/times/1")
    user_response = client.get("/api/v1/users/111")
    
    assert time_response.status_code == 200
    assert user_response.status_code == 200
    assert user_response.json()["id_time"] == 1
