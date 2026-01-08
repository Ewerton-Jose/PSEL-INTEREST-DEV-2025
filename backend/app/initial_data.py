import logging

from sqlmodel import Session, select

from app.core.db import engine, init_db
from app.models import User, Time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_sample_data(session: Session) -> None:
    """Cria dados de exemplo se o banco estiver vazio."""
    
    # Verificar se já existem dados
    existing_users = session.exec(select(User)).first()
    if existing_users:
        logger.info("Dados já existem no banco de dados, pulando população inicial")
        return
    
    # Criar usuários líderes
    lider_backend = User(
        cpf_user="12345678901",
        nome="Carlos Silva",
        funcao="LIDER",
        id_time=None  # Será atualizado após criar o time
    )
    
    lider_frontend = User(
        cpf_user="23456789012",
        nome="Ana Costa",
        funcao="LIDER",
        id_time=None
    )
    
    lider_devops = User(
        cpf_user="34567890123",
        nome="Pedro Santos",
        funcao="LIDER",
        id_time=None
    )
    
    # Criar membros do time backend
    dev_backend_1 = User(
        cpf_user="45678901234",
        nome="João Oliveira",
        funcao="DESENVOLVEDOR",
        id_time=None  # Será atualizado após criar o time
    )
    
    dev_backend_2 = User(
        cpf_user="56789012345",
        nome="Maria Ferreira",
        funcao="DESENVOLVEDOR",
        id_time=None
    )
    
    # Criar membros do time frontend
    dev_frontend_1 = User(
        cpf_user="67890123456",
        nome="Lucas Gomes",
        funcao="DESENVOLVEDOR",
        id_time=None
    )
    
    dev_frontend_2 = User(
        cpf_user="78901234567",
        nome="Beatriz Martins",
        funcao="DESENVOLVEDOR",
        id_time=None
    )
    
    # Criar membros do time devops
    dev_devops_1 = User(
        cpf_user="89012345678",
        nome="Rafael Costa",
        funcao="ENGENHEIRO",
        id_time=None
    )
    
    # Adicionar usuários à sessão primeiro
    session.add(lider_backend)
    session.add(lider_frontend)
    session.add(lider_devops)
    session.add(dev_backend_1)
    session.add(dev_backend_2)
    session.add(dev_frontend_1)
    session.add(dev_frontend_2)
    session.add(dev_devops_1)
    session.commit()
    
    # Agora criar os times com referência aos líderes
    time_backend = Time(
        id_time=1,
        nome_time="Backend",
        responsabilidades="Desenvolvimento de APIs e serviços backend",
        cpf_lider="12345678901"
    )
    
    time_frontend = Time(
        id_time=2,
        nome_time="Frontend",
        responsabilidades="Desenvolvimento de interfaces e componentes web",
        cpf_lider="23456789012"
    )
    
    time_devops = Time(
        id_time=3,
        nome_time="DevOps",
        responsabilidades="Infraestrutura, CI/CD e deployment",
        cpf_lider="34567890123"
    )
    
    session.add(time_backend)
    session.add(time_frontend)
    session.add(time_devops)
    session.commit()
    
    # Atualizar os usuários com suas respectivas equipes
    lider_backend = session.exec(select(User).where(User.cpf_user == "12345678901")).first()
    lider_backend.id_time = 1
    
    lider_frontend = session.exec(select(User).where(User.cpf_user == "23456789012")).first()
    lider_frontend.id_time = 2
    
    lider_devops = session.exec(select(User).where(User.cpf_user == "34567890123")).first()
    lider_devops.id_time = 3
    
    dev_backend_1_db = session.exec(select(User).where(User.cpf_user == "45678901234")).first()
    dev_backend_1_db.id_time = 1
    
    dev_backend_2_db = session.exec(select(User).where(User.cpf_user == "56789012345")).first()
    dev_backend_2_db.id_time = 1
    
    dev_frontend_1_db = session.exec(select(User).where(User.cpf_user == "67890123456")).first()
    dev_frontend_1_db.id_time = 2
    
    dev_frontend_2_db = session.exec(select(User).where(User.cpf_user == "78901234567")).first()
    dev_frontend_2_db.id_time = 2
    
    dev_devops_1_db = session.exec(select(User).where(User.cpf_user == "89012345678")).first()
    dev_devops_1_db.id_time = 3
    
    session.add_all([
        lider_backend,
        lider_frontend,
        lider_devops,
        dev_backend_1_db,
        dev_backend_2_db,
        dev_frontend_1_db,
        dev_frontend_2_db,
        dev_devops_1_db
    ])
    session.commit()
    
    logger.info("Dados de exemplo criados com sucesso!")
    logger.info("Times criados: Backend, Frontend, DevOps")
    logger.info("Total de usuários: 8")


def init() -> None:
    with Session(engine) as session:
        init_db(session)
        create_sample_data(session)


def main() -> None:
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
