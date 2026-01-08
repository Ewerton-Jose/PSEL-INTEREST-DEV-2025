"""
Script para popular o banco de dados com dados de exemplo.
Execute este script após aplicar as migrações.

Uso:
    make backend-shell
    python scripts/seed_data.py
"""

from sqlmodel import Session, select
from app.core.db import engine
from app.models import Time, User


def seed_users():
    """Cria usuários de exemplo (ANTES dos times, pois times precisam de líderes)"""
    users = [
        # Futuros líderes
        User(
            cpf_user="12345678901",
            nome="João Silva",
            funcao="Tech Lead",
            id_time=None
        ),
        User(
            cpf_user="98765432100",
            nome="Maria Santos",
            funcao="Gerente de Marketing",
            id_time=None
        ),
        User(
            cpf_user="11122233344",
            nome="Roberto Alves",
            funcao="Coordenador de RH",
            id_time=None
        ),
        User(
            cpf_user="55566677788",
            nome="Fernanda Rocha",
            funcao="Analista Financeiro",
            id_time=None
        ),
        User(
            cpf_user="99988877766",
            nome="Lucas Martins",
            funcao="Coordenador de Operações",
            id_time=None
        ),
        
        # Membros do time
        User(
            cpf_user="12345678902",
            nome="Ana Costa",
            funcao="Desenvolvedora Full Stack",
            id_time=None
        ),
        User(
            cpf_user="12345678903",
            nome="Carlos Souza",
            funcao="Desenvolvedor Backend",
            id_time=None
        ),
        User(
            cpf_user="98765432101",
            nome="Pedro Oliveira",
            funcao="Social Media",
            id_time=None
        ),
        User(
            cpf_user="11122233345",
            nome="Julia Lima",
            funcao="Analista de RH",
            id_time=None
        ),
        User(
            cpf_user="55566677789",
            nome="Marcelo Dias",
            funcao="Contador",
            id_time=None
        ),
        User(
            cpf_user="44455566677",
            nome="Patricia Gomes",
            funcao="Estagiária",
            id_time=None
        ),
        User(
            cpf_user="33344455566",
            nome="Ricardo Santos",
            funcao="Freelancer",
            id_time=None
        ),
    ]
    return users


def seed_times():
    """Cria times de exemplo (DEPOIS dos usuários, pois precisam dos líderes)"""
    times = [
        Time(
            id_time=1,
            nome_time="Desenvolvimento",
            responsabilidades="Criar e manter aplicações web e mobile",
            cpf_lider="12345678901"  # João Silva
        ),
        Time(
            id_time=2,
            nome_time="Marketing",
            responsabilidades="Promover produtos e gerenciar campanhas",
            cpf_lider="98765432100"  # Maria Santos
        ),
        Time(
            id_time=3,
            nome_time="Recursos Humanos",
            responsabilidades="Gestão de pessoas e recrutamento",
            cpf_lider="11122233344"  # Roberto Alves
        ),
        Time(
            id_time=4,
            nome_time="Financeiro",
            responsabilidades="Gestão financeira e contábil",
            cpf_lider="55566677788"  # Fernanda Rocha
        ),
        Time(
            id_time=5,
            nome_time="Operações",
            responsabilidades="Gestão operacional e logística",
            cpf_lider="99988877766"  # Lucas Martins
        ),
    ]
    return times


def atribuir_membros_aos_times(session: Session):
    """Atribui membros aos times após a criação de ambos"""
    atribuicoes = [
        # Time Desenvolvimento (id=1)
        ("12345678901", 1),  # João Silva (líder)
        ("12345678902", 1),  # Ana Costa
        ("12345678903", 1),  # Carlos Souza
        
        # Time Marketing (id=2)
        ("98765432100", 2),  # Maria Santos (líder)
        ("98765432101", 2),  # Pedro Oliveira
        
        # Time RH (id=3)
        ("11122233344", 3),  # Roberto Alves (líder)
        ("11122233345", 3),  # Julia Lima
        
        # Time Financeiro (id=4)
        ("55566677788", 4),  # Fernanda Rocha (líder)
        ("55566677789", 4),  # Marcelo Dias
        
        # Time Operações (id=5)
        ("99988877766", 5),  # Lucas Martins (líder)
        
        # Usuários sem time: Patricia e Ricardo
    ]
    
    for cpf, id_time in atribuicoes:
        user = session.get(User, cpf)
        if user:
            user.id_time = id_time
            session.add(user)


def main():
    """Função principal para popular o banco de dados"""
    print("🌱 Iniciando seed do banco de dados...")
    print("\n⚠️  REGRAS DE NEGÓCIO:")
    print("   • Todo time DEVE ter um líder")
    print("   • Um usuário só pode ser líder de UM time")
    print("   • Usuários só podem pertencer a UM time por vez")
    
    with Session(engine) as session:
        # Verificar se já existem dados
        existing_users = session.exec(select(User)).first()
        if existing_users:
            print("\n⚠️  Banco já contém dados. Deseja continuar? (s/n)")
            response = input().lower()
            if response != 's':
                print("❌ Operação cancelada")
                return
        
        # 1. Criar usuários PRIMEIRO (pois times precisam de líderes)
        print("\n👥 Criando usuários...")
        users = seed_users()
        for user in users:
            existing = session.get(User, user.cpf_user)
            if not existing:
                session.add(user)
                print(f"  ✓ Usuário criado: {user.nome}")
            else:
                print(f"  ⊙ Usuário já existe: {user.nome}")
        
        session.commit()
        print(f"✅ {len(users)} usuários processados")
        
        # 2. Criar times (agora os líderes já existem)
        print("\n📁 Criando times...")
        times = seed_times()
        for time in times:
            existing = session.get(Time, time.id_time)
            if not existing:
                lider = session.get(User, time.cpf_lider)
                if lider:
                    session.add(time)
                    print(f"  ✓ Time criado: {time.nome_time} (Líder: {lider.nome})")
                else:
                    print(f"  ❌ Erro: Líder {time.cpf_lider} não encontrado para time {time.nome_time}")
            else:
                print(f"  ⊙ Time já existe: {time.nome_time}")
        
        session.commit()
        print(f"✅ {len(times)} times processados")
        
        # 3. Atribuir membros aos times
        print("\n🔗 Atribuindo membros aos times...")
        atribuir_membros_aos_times(session)
        session.commit()
        print("✅ Membros atribuídos aos times")
        
        # Resumo
        print("\n" + "="*50)
        print("📊 RESUMO")
        print("="*50)
        
        total_times = len(session.exec(select(Time)).all())
        total_users = len(session.exec(select(User)).all())
        users_with_team = len(session.exec(select(User).where(User.id_time.isnot(None))).all())
        users_without_team = total_users - users_with_team
        
        # Contar líderes
        lideres = session.exec(select(Time)).all()
        cpfs_lideres = [t.cpf_lider for t in lideres]
        
        print(f"Times no banco: {total_times}")
        print(f"Usuários no banco: {total_users}")
        print(f"  - Com time: {users_with_team}")
        print(f"  - Sem time: {users_without_team}")
        print(f"  - São líderes: {len(cpfs_lideres)}")
        
        print("\n📋 Detalhamento dos Times:")
        for time in lideres:
            lider = session.get(User, time.cpf_lider)
            membros = session.exec(select(User).where(User.id_time == time.id_time)).all()
            print(f"\n  {time.nome_time}:")
            print(f"    Líder: {lider.nome if lider else 'N/A'}")
            print(f"    Total de membros: {len(membros)}")
            for membro in membros:
                marcador = "👑" if membro.cpf_user == time.cpf_lider else "  "
                print(f"      {marcador} {membro.nome} ({membro.funcao})")
        
        print("\n✨ Seed concluído com sucesso!")
        print("\n💡 Acesse a API em: http://localhost:8000/docs")


if __name__ == "__main__":
    main()
