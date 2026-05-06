#!/usr/bin/env python3
"""
Restio Bem-Estar — Atualizador de Produtos
==========================================
Busca/simula produtos de bem-estar em alta, gera descricoes
persuasivas e salva o products.json atualizado.

Uso:
    python scripts/update_products.py

Para dados reais da Amazon (opcional):
    pip install python-amazon-paapi requests
"""

import json
import random
import datetime
import os

# ─── Configuracao ───────────────────────────────────────────
AFFILIATE_TAG = "restiobr-20"
AMAZON_BASE   = "https://www.amazon.com.br/dp/{asin}?tag=" + AFFILIATE_TAG
OUTPUT_PATH   = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")

# ─── Catalogo de Produtos ───────────────────────────────────
PRODUCT_CATALOG = [
    {
        "asin": "B07X3X7X5K",
        "title": "Mascara de Dormir Manta Sleep – Blackout Total Sem Pressao nos Olhos",
        "category": "sono",
        "image": "https://images-na.ssl-images-amazon.com/images/I/71QZ3XQHOLL._AC_SL1500_.jpg",
        "base_rating": 4.5, "base_reviews": 12847,
        "badge": "Mais Vendido", "price": "R$ 189,90",
        "features": [
            "Blackout 100% sem pressao nas palpebras",
            "Copos ajustaveis para qualquer formato de rosto",
            "Espuma memory foam ultrasuave",
            "Lavavel na maquina e ideal para viagens",
            "Bloqueia 100% da luz sem comprimir os olhos"
        ],
        "problema": "dificuldade para conseguir um sono profundo e restaurador por causa da intrusao de luz",
        "gancho": "A intrusao de luz e uma das principais razoes pelas quais as pessoas acordam entorpecidas — a Manta resolve isso de vez.",
        "beneficio": "ambiente de blackout total sem pressao que permite ao olho se mover livremente durante o sono REM",
        "prova_social": "milhares de usuarios relatam adormecer mais rapido e acordar genuinamente descansados pela primeira vez em anos"
    },
    {
        "asin": "B08HJXS7VM",
        "title": "Umidificador Difusor de Aromas 500ml – Aromaterapia Ultrassonico 7 Cores LED",
        "category": "estresse",
        "image": "https://images-na.ssl-images-amazon.com/images/I/71vP7F2GKSL._AC_SL1500_.jpg",
        "base_rating": 4.6, "base_reviews": 38921,
        "badge": "Mais Avaliado", "price": "R$ 149,90",
        "features": [
            "Reservatorio de 500ml — funciona ate 10 horas",
            "7 cores de LED ambiente ajustaveis",
            "4 opcoes de timer e desligamento automatico",
            "Tecnologia ultrassonica silenciosa",
            "Livre de BPA, seguro para casa e escritorio"
        ],
        "problema": "estresse cronico e incapacidade de desacelerar apos dias exigentes",
        "gancho": "Sua casa deveria ser o seu refugio — nao uma extensao do caos.",
        "beneficio": "transforma qualquer ambiente em um oasis calmo com aromaterapia comprovada para reduzir o cortisol",
        "prova_social": "mais de 38 mil avaliacoes cinco estrelas fazem deste o difusor favorito dos entusiastas do bem-estar"
    },
    {
        "asin": "B09G3PQG8K",
        "title": "Garrafa Termica Stanley Quencher 1,18L – Inox, Mantem Gelado 24h",
        "category": "energia",
        "image": "https://images-na.ssl-images-amazon.com/images/I/61KvS3HVOZL._AC_SL1500_.jpg",
        "base_rating": 4.8, "base_reviews": 87432,
        "badge": "Mais Vendido", "price": "R$ 349,90",
        "features": [
            "Aco inoxidavel 18/8 de grau profissional",
            "Mantem bebidas geladas por 24 horas, quentes por 12h",
            "Capacidade de 1,18L — hidratacao o dia todo",
            "Livre de BPA e ftalatos, sem transferencia de sabor",
            "Boca larga — cabe gelo em pedacos grandes"
        ],
        "problema": "desidratacao cronica silenciosa que reduz energia, foco e desempenho fisico",
        "gancho": "Desidratacao de apenas 1-2% abaixo do ideal pode reduzir energia e foco em ate 30%.",
        "beneficio": "agua gelada por 24 horas que torna a hidratacao adequada simples e genuinamente agradavel",
        "prova_social": "confiada por atletas, profissionais e entusiastas do ar livre com mais de 87 mil avaliacoes entusiasmadas"
    },
    {
        "asin": "B082BZHZQM",
        "title": "Magnesio Dimalato 500mg – Suplemento para Estresse, Sono e Energia",
        "category": "estresse",
        "image": "https://images-na.ssl-images-amazon.com/images/I/71mKMSSMCmL._AC_SL1500_.jpg",
        "base_rating": 4.5, "base_reviews": 29183,
        "badge": "Mais Avaliado", "price": "R$ 79,90",
        "features": [
            "Formula antiestresse com magnesio dimalato",
            "Suporta niveis saudaveis de magnesio no organismo",
            "Vegano, sem gluten e sem OGM",
            "Ajuda a relaxar musculos e acalmar o sistema nervoso",
            "Fabricado seguindo Boas Praticas de Fabricacao (BPF)"
        ],
        "problema": "estresse cronico, sono ruim e baixa energia causados por deficiencia de magnesio",
        "gancho": "Ate 50% das pessoas nao consomem magnesio suficiente — as consequencias sao estresse, tensao e nevoa mental.",
        "beneficio": "reposicao de magnesio para acalmar o sistema nervoso e fazer a transicao do modo estressado para o sereno",
        "prova_social": "milhares de clientes descrevem como a arma secreta deles para desacelerar depois de dias intensos"
    },
    {
        "asin": "B07D9YM6VL",
        "title": "Tapete de Yoga Gaiam Premium – 6mm, Antiderrapante, 173cm x 61cm",
        "category": "foco",
        "image": "https://images-na.ssl-images-amazon.com/images/I/71fgKMfWLuL._AC_SL1500_.jpg",
        "base_rating": 4.7, "base_reviews": 45621,
        "badge": "Mais Vendido", "price": "R$ 129,90",
        "features": [
            "Espessura de 6mm para conforto e suporte articular",
            "Superficie texturizada antiderrapante frente e verso",
            "Leve com alca de transporte incluida",
            "Livre de ftalatos e latex certificados",
            "Disponivel em varias cores vibrantes"
        ],
        "problema": "escorregamento, dor nas articulacoes e distracao durante o yoga que interrompem a conexao mente-corpo",
        "gancho": "Seu tapete de yoga e a fundacao da sua pratica — um tapete ruim quebra a experiencia completamente.",
        "beneficio": "espessura e aderencia que permitem focar completamente na respiracao e no momento presente",
        "prova_social": "mais de 45 mil compradores verificados confirmam ser o tapete perfeito para iniciantes e praticantes experientes"
    },
    {
        "asin": "B07M63VSKQ",
        "title": "Rolo de Massagem Foam Roller – Alta Densidade, 33cm, Recuperacao Muscular",
        "category": "energia",
        "image": "https://images-na.ssl-images-amazon.com/images/I/71Qn8DQTHZL._AC_SL1500_.jpg",
        "base_rating": 4.7, "base_reviews": 31847,
        "badge": "Mais Avaliado", "price": "R$ 89,90",
        "features": [
            "Alta densidade para alivio profundo da tensao muscular",
            "Superficie multidensidade imita as maos de um massoterapeuta",
            "Suporta ate 220kg sem deformar",
            "Tamanho compacto de 33cm para uso localizado",
            "Indicado por fisioterapeutas e educadores fisicos"
        ],
        "problema": "musculos tensos, dores persistentes e mobilidade reduzida pela vida sedentaria moderna",
        "gancho": "Musculos tensos nao afetam apenas atletas — sao o imposto silencioso da vida moderna.",
        "beneficio": "penetra profundamente no tecido muscular para liberar tensoes e restaurar a mobilidade",
        "prova_social": "indicado por fisioterapeutas em todo o Brasil e usado por atletas profissionais de alto desempenho"
    },
    {
        "asin": "B08G9NBQS2",
        "title": "Oculos Anti Luz Azul – Protecao para Telas, Bloqueio UV, Leve e Confortavel",
        "category": "sono",
        "image": "https://images-na.ssl-images-amazon.com/images/I/61KKGxo5W0L._AC_SL1500_.jpg",
        "base_rating": 4.4, "base_reviews": 8932,
        "badge": "Mais Vendido", "price": "R$ 99,90",
        "features": [
            "Bloqueia 90%+ da luz azul prejudicial (400-450nm)",
            "Revestimento antirreflexo reduz a fadiga ocular",
            "Armacao leve TR90 — confortavel para uso prolongado",
            "Ideal para computador, celular e TV",
            "Sem grau — serve para todos os tipos de visao"
        ],
        "problema": "supressao de melatonina induzida por telas dificultando adormecer e manter o sono",
        "gancho": "Cada noite no celular diz ao seu cerebro que e meio-dia — os oculos anti luz azul corrigem isso.",
        "beneficio": "filtro das frequencias de luz mais prejudiciais ao sono para restaurar a producao natural de melatonina",
        "prova_social": "milhares de clientes relatam adormecer mais rapido e dormir mais profundo ja na primeira noite de uso"
    },
    {
        "asin": "B07ZNQF8BD",
        "title": "Pistola de Massagem Eletrica – Percussao Profissional, 6 Velocidades, 6 Cabecas",
        "category": "energia",
        "image": "https://images-na.ssl-images-amazon.com/images/I/61NnHWFnoxL._AC_SL1500_.jpg",
        "base_rating": 4.6, "base_reviews": 19283,
        "badge": "Mais Avaliado", "price": "R$ 299,90",
        "features": [
            "6 velocidades e 6 cabecas intercambiaveis",
            "Motor silencioso — menos de 45 decibeis",
            "Bateria de longa duracao: ate 6 horas de uso",
            "Design ergonomico para alcancar todas as regioes",
            "Indicada para pre e pos-treino e uso diario"
        ],
        "problema": "dor muscular persistente e mobilidade reduzida apos treinos ou longas horas de trabalho",
        "gancho": "A dor muscular costumava significar dias de espera — a pistola de massagem muda isso em 60 segundos.",
        "beneficio": "terapia de percussao de grau profissional que acelera a recuperacao muscular drasticamente",
        "prova_social": "usada por atletas de alto desempenho e recomendada por fisioterapeutas em todo o Brasil"
    }
]


# ─── Gerador de Descricoes ──────────────────────────────────

def generate_description(product: dict) -> str:
    templates = [
        (
            "Voce esta {problema}? Nao esta sozinho — e um dos desafios de bem-estar mais comuns no Brasil de hoje. "
            "{gancho} "
            "O {nome_curto} foi desenvolvido para resolver exatamente esse problema. "
            "Ao oferecer {beneficio}, ele cria o tipo de melhoria diaria significativa que se acumula ao longo do tempo. "
            "E os resultados falam por si: {prova_social}. "
            "Seja voce iniciante na jornada de bem-estar ou otimizando uma rotina ja solida, "
            "esta e uma daquelas ferramentas que voce vai se perguntar como vivia sem ela."
        ),
        (
            "Se voce esta {problema}, a ciencia e milhares de usuarios reais concordam: voce precisa das ferramentas certas. "
            "{gancho} "
            "E exatamente por isso que o {nome_curto} se tornou essencial na rotina de pessoas focadas em bem-estar em todo o Brasil. "
            "Sua proposta e simples: {beneficio}. "
            "A comunidade de usuarios ja falou — {prova_social}. "
            "Nao e apenas a nossa palavra: as notas e o volume de avaliacoes contam a historia completa."
        ),
        (
            "O mundo moderno tornou {problema} quase inevitavel. "
            "{gancho} "
            "O {nome_curto} existe para mudar isso. "
            "Desenvolvido especificamente para oferecer {beneficio}, ele ataca a causa raiz — nao apenas os sintomas. "
            "Veja o que a evidencia mostra: {prova_social}. "
            "Se voce esta pronto para levar o seu bem-estar a serio, e exatamente aqui que comecar."
        )
    ]

    template    = random.choice(templates)
    nome_curto  = product["title"].split("–")[0].strip()

    return template.format(
        problema    = product.get("problema", "buscando mais bem-estar"),
        gancho      = product.get("gancho", ""),
        nome_curto  = nome_curto,
        beneficio   = product.get("beneficio", "melhorias significativas de bem-estar"),
        prova_social= product.get("prova_social", "milhares de clientes satisfeitos"),
    )


# ─── Simular Dados ao Vivo ──────────────────────────────────

def simulate_live_data(product: dict) -> dict:
    """
    Simula pequenas variacoes diarias em notas e avaliacoes.
    Substitua por chamadas reais a API quando a Amazon PA-API estiver configurada.
    """
    review_delta = random.randint(0, 80)
    new_reviews  = product["base_reviews"] + review_delta
    rating_delta = random.uniform(-0.05, 0.05)
    new_rating   = round(max(1.0, min(5.0, product["base_rating"] + rating_delta)), 1)
    return {**product, "rating": new_rating, "reviews": new_reviews}


# ─── API da Amazon (opcional) ───────────────────────────────
# Descomente e configure para usar dados em tempo real:
#
# from paapi5_python_sdk.api.default_api import DefaultApi
# from paapi5_python_sdk.models.partner_type import PartnerType
# ...
# def fetch_amazon_data(asins):
#     client = DefaultApi(
#         access_key=os.environ.get("AMAZON_ACCESS_KEY"),
#         secret_key=os.environ.get("AMAZON_SECRET_KEY"),
#         host="webservices.amazon.com.br",
#         region="us-east-1"
#     )
#     ...


# ─── Main ───────────────────────────────────────────────────

def build_products() -> list:
    products = []
    today    = datetime.date.today().isoformat()

    for p in PRODUCT_CATALOG:
        updated = simulate_live_data(p)
        entry   = {
            "asin":                  updated["asin"],
            "title":                 updated["title"],
            "category":              updated["category"],
            "image":                 updated["image"],
            "rating":                updated["rating"],
            "reviews":               updated["reviews"],
            "badge":                 updated.get("badge", ""),
            "price":                 updated.get("price", ""),
            "features":              updated["features"],
            "generated_description": generate_description(updated),
            "last_updated":          today,
            "affiliate_link":        AMAZON_BASE.format(asin=updated["asin"]),
        }
        products.append(entry)
        print(f"  OK {entry['title'][:52]}...  estrelas:{entry['rating']}  ({entry['reviews']:,} avals.)")

    return products


def main():
    print("=" * 62)
    print("  Restio Bem-Estar -- Atualizador de Produtos")
    print(f"  Executado em: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 62)

    products = build_products()
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 62)
    print(f"  Salvo com sucesso: {len(products)} produtos em {OUTPUT_PATH}")
    print("=" * 62)


if __name__ == "__main__":
    main()
