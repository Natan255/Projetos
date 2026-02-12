#!/usr/bin/env python3

import pyautogui as pg
import pynput as pp
import os
from time import sleep


def apagar_comando(nome_arquivo):
    numeros_comandos = input("Digite a linha que deseja apagar: ")
    with open(f"{nome_arquivo}.txt", "r", encoding="utf-8") as arquivo:
        linhas = arquivo.readlines()
        linhas.pop(int(numeros_comandos) - 1)
    with open(f"{nome_arquivo}.txt", "w", encoding="utf-8") as arquivo:
        arquivo.writelines(linhas)

def opcao_usuario():
    while True:
        try:
            entrada = input("Selecione a opção desejada: ").strip()
            opcao = int(entrada)
            return opcao
            
        except ValueError:
            print("\n[!] Você selecionou um caractere inválido. Tente novamente.")

def mostrar_menu():
   print('''                                                                                             
              ,,                           
  .g8"""bgd `7MM                 `7MM      
.dP'     `M   MM                   MM      
dM'       `   MM   ,6"Yb.  ,p6"bo  MM  ,MP'
MM            MM  8)   MM 6M'  OO  MM ;Y   
MM.           MM   ,pm9MM 8M       MM;Mm   
`Mb.     ,'   MM  8M   MM YM.    , MM `Mb. 
  `"bmmmd'  .JMML.`Moo9^Yo.YMbmd'.JMML. YA.
                                                                                 
         by Natan255
   ''')

   print("+-----------------------------------+")
   print("[1] - Criar automatização")
   print("[2] - Ativar automatizações")
   print("[3] - Editar automatizações")
   print("[4] - Configurações")
   print("[5] - Sair")
   print("+-----------------------------------+")

def mostrar_automatizacao(nome_arquivo):
    print("+-----------------------------------+")
    with open(f"{nome_arquivo}.txt", "r", encoding="utf-8") as arquivo:
        for i, linha in enumerate(arquivo, start=1):
            print(f"[{i}] {linha.strip()}")
    print("+-----------------------------------+")

def mostrar_menu_conclusao():
    print("+-----------------------------------+")
    print("[1] - Apagar comando expecifico e continuar editando")
    print("[2] - Concluir automatização")
    print("+-----------------------------------+")
    opcao = opcao_usuario()
    print(opcao)


    if opcao == 1:
        mostrar_automatizacao()
        rodando = True
        while rodando:
            try:
                mostrar_automatizacao("meus_comandos")
                apagar_comando("meus_comandos")
                print("+-----------------------------------+")
                print("[1] - Continuar editando")
                print("[2] - Concluir automatização")
                print("+-----------------------------------+")
                opcao2 = opcao_usuario()
                if opcao2 == 1:
                    ouvir_comandos()
                elif opcao2 == 2:
                    print("[Ok] Automatização concluída com sucesso!")
                    nome_arquivo = input("[?] Qual o nome do arquivo para salvar a automatização? (sem extensão): ")
                    with open(f"{nome_arquivo}.txt", "w", encoding="utf-8") as arquivo_saida:
                        with open("meus_comandos.txt", "r", encoding="utf-8") as arquivo_entrada:
                            arquivo_saida.write(arquivo_entrada.read())
                            os.remove("meus_comandos.txt")
                    print(f"[Ok] Automatização salva como {nome_arquivo}.txt")
                    print("[!] Voltando para o menu principal...")
                    sleep(2)
                    
                rodando = False
            except ValueError:
                print("\n[!] Você selecionou um caracter invalido tente novamente")

    elif opcao == 2:
         
         print("[Ok] Automatização concluída com sucesso!")
         nome_arquivo = input("[?] Qual o nome do arquivo para salvar a automatização? (sem extensão): ")
         with open(f"{nome_arquivo}.txt", "w", encoding="utf-8") as arquivo_saida:
             with open("meus_comandos.txt", "r", encoding="utf-8") as arquivo_entrada:
                 arquivo_saida.write(arquivo_entrada.read())
                 os.remove("meus_comandos.txt")
         print(f"[Ok] Automatização salva como {nome_arquivo}.txt")
         print("[!] Voltando para o menu principal...")
         sleep(2)

def mostrar_menu_edicao():
    try:
        nome_arquivo = input("[?] Qual o nome do arquivo da automatização que deseja editar? (sem extensão): ")
        
    except FileNotFoundError:
        print("[!] Arquivo não encontrado!")
        return
    while True:
        print("[!] Recomendo que edite manualmente no texto pois é mais eficaz")
        print("+-----------------------------------+")
        print("[1] - apagar comando")
        print("[2] - adicionar comando")
        print("[3] - voltar para o menu principal")
        print("+-----------------------------------+")
        
        opcao = opcao_usuario()
        mostrar_automatizacao(nome_arquivo)
        if opcao == 1:
            apagar_comando(nome_arquivo)
            mostrar_automatizacao(nome_arquivo)
        elif opcao == 2:
            print("[?] Selecione a linha, e o seu novo comando sera adicionado logo acima a ela")
            linha_1 = int(input("Entre a linha: "))

            if linha_1 < 1 or linha_1 > len(open(f"{nome_arquivo}.txt", "r", encoding="utf-8").readlines()) + 1:
                print("[!] Linha inválida, tente novamente.")
                continue
            else:
                with open(f"{nome_arquivo}.txt", "r", encoding="utf-8") as arquivo:
                    linhas = arquivo.readlines()
                print("[!]Cuidado com o comando que voce esta adicionando, ele sera adicionado exatamente na linha que voce selecionou e isso pode fazer com que a automatização nao funcione como esperado se o comando for adicionado no lugar errado")
                comando_novo = input("[?] Digite o comando que deseja adicionar: ")
                linhas.insert(int(linha_1) - 1, f"{comando_novo}\n")
                with open(f"{nome_arquivo}.txt", "w", encoding="utf-8") as arquivo:
                    arquivo.writelines(linhas)
                mostrar_automatizacao(nome_arquivo)
        elif opcao == 3:
            print("[Ok] Voltando para o menu principal...")
            sleep(2)
            break
        else:
            print("[!] Opção inválida, tente novamente.")

def salvar_teclado(tecla):

    try:
        if tecla.char == '5':
            return False
        tecla = tecla.char 
    except AttributeError:
        tecla = str(tecla)
    print(f"[Ok] Comando {tecla} registrado com sucesso!")

    

    with open("meus_comandos.txt", "a", encoding="utf-8") as arquivo:
        arquivo.write(f"{tecla}\n")

def salvar_mouse(x, y, button, pressed):
    if pressed:
        print(f"Mouse clicado em ({x}, {y}) com {button}")
        with open("meus_comandos.txt", "a", encoding="utf-8") as arquivo:
            arquivo.write(f"{x},{y},{button}\n")

def ouvir_comandos():
    print("+-----------------------------------+")
    print("[!] Os locais em que o mouse estiver em cima no momento que voce clicar serao registrados ")
    print("[!] O comando para parar sera o 5 caso queira alterar devido ao seu contexto va em configuracao no menu") 
    print("+-----------------------------------+")
    with pp.keyboard.Listener(on_press=salvar_teclado) as listener_teclado, \
         pp.mouse.Listener(on_click=salvar_mouse) as listener_mouse:

        listener_teclado.join()
        listener_mouse.stop()
    mostrar_menu_conclusao()
    
def ativar_automatização():
    print("+-----------------------------------+")
    print("[!] As automatizações devem estar na mesma pasta do programa e devem ser arquivos .txt")
    print("+-----------------------------------+")
    nome_arquivo = input("[?] Digite o nome do arquivo da automatização que deseja ativar (sem extensão): ").strip()
    mapeamento = {
        "Key.enter": "enter",
        "Key.esc": "esc",
        "Key.cmd": "win",
        "Key.space": "space",
        "Key.tab": "tab",
        "Key.backspace": "backspace",
        "Key.shift": "shift",
        "Key.ctrl_l": "ctrl",
        "Key.ctrl_r": "ctrl",
        "Key.alt_l": "alt",
        "Key.alt_gr": "altright",
        "Key.caps_lock": "capslock",
        "Key.up": "up",
        "Key.down": "down",
        "Key.left": "left",
        "Key.right": "right",
        "Key.num_lock": "numlock",
        "Key.print_screen": "printscreen",
        "Key.delete": "delete",
    }
    try:
        with open(f"{nome_arquivo}.txt", "r", encoding="utf-8") as arquivo:
            comandos = arquivo.readlines()
            for comando in comandos:
                comando = comando.strip()
                print(f"[Ok] Executando comando: {comando}")
                if comando.count(',') == 2:
                    x, y, button = comando.split(',')
                    if 'Button.right' in button:
                        pg.rightClick(int(x), int(y))
                    else:
                        pg.click(int(x), int(y))
                    sleep(0.25)
                else:
                    if comando in mapeamento:
                        comando_esp = mapeamento[comando]
                        pg.press(comando_esp,interval=0.1)
                    pg.press(comando, interval=0.1)
        print(f"[Ok] Automatização {nome_arquivo}.txt ativada com sucesso!")
    except FileNotFoundError:
        print(f"[!] Arquivo {nome_arquivo}.txt não encontrado. Verifique o nome e tente novamente.")


while True:
    mostrar_menu()
    opcao = opcao_usuario()

    if opcao == 1:
        ouvir_comandos()
    elif opcao == 2:
        ativar_automatização()
    elif opcao == 3:
        mostrar_menu_edicao()
    elif opcao == 5:
        print("[Ok] Saindo do programa...")
        break

    #adicionar opcao de editar os comandos depois de gravados. (talvez so recomendar que abra o arquivo em um editor de texto mesmo e fornecer o comando das teclas especiais para o usuario editar o arquivo manualmente)
    #adicionar opcao de colocar delay entre os comandos (talvez o comando seja o tempo em segundos entre os comandos ou um comando especifico para delay tipo "delay 2" para delay de 2 segundos que ficara registrado no arquivo como "delay,2" e na hora de executar o programa ele vai ler o comando e se for delay ele vai usar o time.sleep para esperar o tempo especificado antes de executar o proximo comando)
    # adicionar opcao de configurar o comando para parar a gravação
    # talvez perguntar pro usuario se ele quer que execute os comados na velocidade de robo ou na velocidade que ele registrou (para isso talvez seja necessario registrar o tempo entre os comandos e na hora de executar o programa usar o time.sleep para esperar o tempo registrado entre os comandos antes de executar o proximo comando)