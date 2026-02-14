#!/usr/bin/env python3

import pyautogui as pg
import pynput as pp
from collections import deque
import threading
import cv2
import os
import numpy as np
import time
from time import sleep


stop = '5'

BUFFER_SIZE = 10
capturas = deque(maxlen=BUFFER_SIZE)
rodando = True

def capturador_continuo():
    """Thread que fica tirando prints constantemente"""
    while rodando:
        img = pg.screenshot()
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        capturas.append((time.time(), frame))
        time.sleep(0.1)



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
   print("[4] - Alterar parada")
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
                print("[!]Cuidado com o comando que voce esta adicionando, ele sera adicionado exatamente na linha \n " \
                "que voce selecionou e isso pode fazer com que a automatização nao funcione como esperado se o comando for adicionado no lugar errado\n")
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

def mostrar_config():
    global stop
    stop= input("Escolha seu botao de parada: ")
    print("botao de parada registrado! ")

def salvar_mouse_ia(x, y, button, pressed):
    if pressed:
        tempo_clique = time.time()
        
        if len(capturas) > 0:

            timestamp, frame = capturas[-1] 
            alt, larg = frame.shape[:2]
            y1, y2 = max(0, y-60), min(alt, y+60)
            x1, x2 = max(0, x-60), min(larg, x+60)

            roi = frame[y1:y2, x1:x2]
            nome_imagem = f"btn_{int(tempo_clique)}.png"
            cv2.imwrite(nome_imagem, roi)
            with open("meus_comandos.txt", "a", encoding="utf-8") as arquivo:
                arquivo.write(f"{x},{y},{button},{nome_imagem}\n")
            
            print(f"[IA] Clique em ({x},{y}) salvo com referência visual: {nome_imagem}")

def salvar_teclado(tecla):
    global stop
    try:
        if tecla.char == stop:
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

def ouvir_comandos(ia):
    global rodando
    rodando = True
    
    if ia == 1:
        print("[!] Gravando com visão computacional...")
        thread_print = threading.Thread(target=capturador_continuo, daemon=True)
        thread_print.start()
        with pp.keyboard.Listener(on_press=salvar_teclado) as listener_teclado, \
             pp.mouse.Listener(on_click=salvar_mouse_ia) as listener_mouse:
            listener_teclado.join()
            listener_mouse.stop()
        
        rodando = False
        mostrar_menu_conclusao()
    elif ia == 0:
        print("+-----------------------------------+")
        print("[!] Os locais em que o mouse estiver em cima no momento que voce clicar serao registrados ")
        print("[!] O comando para parar sera o 5 caso queira alterar devido ao seu contexto va em configuracao no menu") 
        print("+-----------------------------------+")
        with pp.keyboard.Listener(on_press=salvar_teclado) as listener_teclado, \
            pp.mouse.Listener(on_click=salvar_mouse) as listener_mouse:

            listener_teclado.join()
            listener_mouse.stop()
        mostrar_menu_conclusao()
    
def ativar_automatizacao():
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

def ativar_automatizacao_ia():
    print("+-----------------------------------+")
    print("[!] Executando com Visão Computacional ativa")
    print("+-----------------------------------+")
    nome_arquivo = input("[?] Nome da automatização (sem extensão): ").strip()
    
    MARGEM = 500 
    try:
        with open(f"{nome_arquivo}.txt", "r", encoding="utf-8") as arquivo:
            comandos = arquivo.readlines()
            
            for comando in comandos:
                comando = comando.strip()
                
                if comando.count(',') == 3:
                    x_orig, y_orig, button, nome_imagem = comando.split(',')
                    x_orig, y_orig = int(x_orig), int(y_orig)
                    
                    print(f"[*] Buscando {nome_imagem} próximo a ({x_orig}, {y_orig})...")
                    
                    encontrou = False
                    tentativas = 0
                    
                    while not encontrou and tentativas < 20:

                        tela = pg.screenshot()
                        tela_cv = cv2.cvtColor(np.array(tela), cv2.COLOR_RGB2BGR)
                        
                        h_tela, w_tela = tela_cv.shape[:2]
                        y_start = max(0, y_orig - MARGEM)
                        y_end = min(h_tela, y_orig + MARGEM)
                        x_start = max(0, x_orig - MARGEM)
                        x_end = min(w_tela, x_orig + MARGEM)
                        
                        roi_gray = cv2.cvtColor(tela_cv[y_start:y_end, x_start:x_end], cv2.COLOR_BGR2GRAY)
                        
                        if os.path.exists(nome_imagem):
                            template = cv2.imread(nome_imagem, 0)
                            wt, ht = template.shape[::-1]
                            
                            res = cv2.matchTemplate(roi_gray, template, cv2.TM_CCOEFF_NORMED)
                            _, max_val, _, max_loc = cv2.minMaxLoc(res)
                            
                            if max_val >= 0.7:

                                novo_x = x_start + max_loc[0] + wt // 2
                                novo_y = y_start + max_loc[1] + ht // 2
                                
                                print(f"[IA] Encontrado! Clicando em ({novo_x}, {novo_y}) com {max_val:.2f} de precisão")
                                
                                if 'right' in button.lower():
                                    pg.rightClick(novo_x, novo_y)
                                else:
                                    pg.click(x_orig, y_orig)
                                
                                encontrou = True
                            else:
                                tentativas += 1
                                sleep(0.5)
                        else:
                            print(f"[!] Erro: {nome_imagem} não encontrada. Usando backup.")
                            pg.click(x_orig, y_orig)
                            break
                    
                    if not encontrou:
                        print("[!] Alvo não localizado na região. Pulando...")


                elif comando.count(',') == 2:
                    x, y, button = comando.split(',')
                    pg.click(int(x), int(y))
                
                else:
                    pg.press(comando, interval=0.05)
                
                

        print("[Ok] Automatização concluída!")
    except FileNotFoundError:
        print(f"[!] Arquivo {nome_arquivo}.txt não encontrado.")

while True:
    mostrar_menu()
    opcao = opcao_usuario()

    if opcao == 1:
        print("[1] - Gravaçao de comando com ia ")
        print("[2] - Gravaçao de comando normal")
        opcao_gravacao = opcao_usuario()
        if opcao_gravacao == 1:
            ouvir_comandos(1)
        elif opcao_gravacao == 2:
            ouvir_comandos(0)
    elif opcao == 2:
        print("[1] - Ativar automatizao com ia (so se gravou com ia)")
        print("[2] - Ativar automatizacao")
        opcao_ativacao = opcao_usuario()
        if opcao_ativacao == 1:
            ativar_automatizacao_ia()
        elif opcao_ativacao == 2:
            ativar_automatizacao()
    elif opcao == 3:
        mostrar_menu_edicao()
    elif opcao == 4:
        mostrar_config()
    elif opcao == 5:
        print("[Ok] Saindo do programa...")
        break

#pergunta se quer que clique onde foi pedido ou quer que ele se adapte