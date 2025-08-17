import shutil
import os
from PIL import Image
from pathlib import Path
#ajeitar o fim e o sem letras por casa do .jpg

def fim_organizacao():
    print()
    print("0 - Menu")
    print("1 - Organizar novamente")
    escolha = input()
    if escolha == "0":
        os.system('cls')
        inicio()
    if escolha == "1":
        os.system('cls')
        opcao("2")

def mover_por_condicao(pasta, subpasta, condicao):
    contador = 0
    pasta = Path(pasta)
    destino = pasta / subpasta
    destino.mkdir(exist_ok=True)

    for arquivo in pasta.iterdir(): #retorna um iterador de arquivos da pasta (link)
        if arquivo.is_file() and condicao(arquivo):
            print(f"📁 Movendo {arquivo.name} → {destino.name}/")
            shutil.move(str(arquivo), destino / arquivo.name)
            contador += 1
    
    print(f"\n✅ Organização concluída! {contador} arquivo(s) movido(s) para '{subpasta}'")
    fim_organizacao()

# ------------------------
# Funções específicas
# ------------------------
def organizar_inicio(pasta, sub, inicio):
    mover_por_condicao(pasta, sub, lambda arq: arq.name.startswith(inicio))

def organizar_fim(pasta, sub, fim):
    mover_por_condicao(pasta, sub, lambda arq: arq.stem.endswith(fim))

def organizar_arq(pasta, sub, tipo):
    mover_por_condicao(pasta, sub, lambda arq: arq.suffix.lower() == f".{tipo.lower()}")

def organizar_palavra(pasta, sub, palavra):
    mover_por_condicao(pasta, sub, lambda arq: palavra.lower() in arq.name.lower())

def organizar_sem_num(pasta, sub):
    mover_por_condicao(pasta, sub, lambda arq: not any(char.isdigit() for char in arq.stem))

def organizar_sem_letras(pasta, sub):
    mover_por_condicao(pasta, sub, lambda arq: not any(char.isalpha() for char in arq.stem))

def inicio():

    print(r"""
========================================= 
 ________                __           
/        |              /  |          
$$$$$$$$/__    __   ____$$ |  ______  
   $$ | /  |  /  | /    $$ | /      \ 
   $$ | $$ |  $$ |/$$$$$$$ |/$$$$$$  |
   $$ | $$ |  $$ |$$ |  $$ |$$    $$ |
   $$ | $$ \__$$ |$$ \__$$ |$$$$$$$$/ 
   $$ | $$    $$ |$$    $$ |$$       |
   $$/   $$$$$$$ | $$$$$$$/  $$$$$$$/ 
        /  \__$$ |                    
        $$    $$/                     
         $$$$$$/  
=========================================                   
    """)

    print("Escolha uma opção:")
    print()
    print("0 - Sair")
    print("1 - Instruções")
    print("2 - Organizar")
    escolha = input()
    os.system('cls')
    opcao(escolha)
    

def filtro(pasta, sub):
    print("=" * 50)
    print("Selecione como filtrar os arquivos:")
    print("=" * 50)
    print("1 - tipo de arquivo (ex: pdf, txt, jpg)")
    print("2 - inicio do nome do arquivo (ex: relatorio, foto)")
    print("3 - final do nome do arquivo (ex: 2023, v1)")
    print("4 - palavra contida no nome do arquivo")
    print("5 - sem numeração")
    print("6 - sem letras")
    print("0 - voltar")
    print("=" * 50)
    escolha = input()

    if escolha == "0":
        os.system('cls')
        inicio()

    if escolha == "1":
        print("=" * 50)
        print("Digite o tipo de arquivo (ex: pdf, txt, jpg): ")
        print("=" * 50)
        TIPO_ARQUIVO = input()
        print()
        print()
        
        organizar_arq(pasta, sub, TIPO_ARQUIVO)

    if escolha == "2":
        print("=" * 50)
        print("Digite o inicio do nome do arquivo (ex: relatorio, foto): ")
        print("=" * 50)
        INICIO_NOME = input()
        print()
        print()
        
        organizar_inicio(pasta, sub, INICIO_NOME)

    if escolha == "3":
        print("=" * 50)
        print("Digite o final do nome do arquivo: ")
        print("=" * 50)
        FIM_NOME = input()
        print()
        print()
        
        organizar_fim(pasta, sub, FIM_NOME)
    
    if escolha == "4":
        print("=" * 50)
        print("Digite a palavra contida no nome do arquivo: ")
        print("=" * 50) 
        PALAVRA = input()
        print()
        print()
       
        organizar_palavra(pasta, sub, PALAVRA)

    if escolha == "5":
        organizar_sem_num(pasta, sub)

    if escolha == "6":
        organizar_sem_letras(pasta, sub)


def opcao(escolha):
    if escolha == "0":
        print("Saindo...")
        exit()

    if escolha == "1":
        print()
        print("INSTRUÇÕES:")
        print()
        print("1. Ao Executar o script para organizar os arquivos, prencha o Path com o caminho da pasta ")
        print("em que esta os arquivos que deseja organizar e as subpastas que quer que ele va ex(Download).")
        print("2. Depois escreva o nome da subpasta que deseja que esses arquivos sejam movidos ex (MeusDocumentos).")
        print("3. E por fim diga o tipo de arquivo ex(pdf).")
        print
        print("0 - voltar")
        input()
        os.system('cls')
        inicio()

    if escolha == "2":
        print("=" * 50)
        print("Digite o caminho da pasta que deseja organizar: ")
        print("=" * 50)
        PASTA = input()
        print()
        print()
        PASTA = Path(PASTA)
        print("=" * 50)
        print("Digite o nome da subpasta que deseja criar/guardar (ex MeusDocumentos): ")
        print("=" * 50)
        SUBPASTA = input()
        print()
        print()
        
        filtro(PASTA, SUBPASTA)
        print()

inicio()








#def converter(pasta, tipo, condicao):
#   contador = 0
#    for arquivo in os.listdir(pasta):
#        if arquivo.lower().endswith(".png"):
#            caminho = os.path.join(pasta, arquivo)
#            img = Image.open(caminho).convert("RGB")
#            novo_nome = arquivo.rsplit(".", 1)[0] + ".jpg"
#            img.save(os.path.join(pasta, novo_nome), "JPEG")
