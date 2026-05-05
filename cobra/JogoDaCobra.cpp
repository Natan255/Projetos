#include <iostream>
#include <cstdlib>
#include <string>
#include <vector>
#include <ctime>
#include <unistd.h>
#include <ncurses.h>
using namespace std;

struct Posicao
{
    int i, j;
};

struct Cobra
{
    vector<Posicao> corpo;
    int tamanho;
};

void mostrarTabuleiro(char tabuleiro[20][20])
{
    clear();
    for (int i = 0; i < 20; i++)
    {
        for (int j = 0; j < 20; j++)
        {
            printw("%c ", tabuleiro[i][j]);
        }
        printw("\n");
    }
    refresh();
}

void gerarMaca(char tabuleiro[20][20])
{
    srand(time(0));
    int linha = rand() % 18 + 1;
    int coluna = rand() % 18 + 1;
    tabuleiro[linha][coluna] = 'M';
}

void moverCobra(Cobra &c, char tabuleiro[20][20], char direcao)
{
    Posicao caudaAntiga = c.corpo.back();
    tabuleiro[caudaAntiga.i][caudaAntiga.j] = ' ';

    if (direcao == 'd')
    {
        c.corpo[0].j++;
    }
    if (direcao == 'a')
    {
        c.corpo[0].j--;
    }
    if (direcao == 'w')
    {
        c.corpo[0].i--;
    }
    if (direcao == 's')
    {
        c.corpo[0].i++;
    }

    tabuleiro[c.corpo[0].i][c.corpo[0].j] = 'o';
}

int verificarColisao(Cobra &c)
{
    if (c.corpo[0].j == 0 || c.corpo[0].j == 19 || c.corpo[0].i == 0 || c.corpo[0].i == 19) // verifica se a cabeça bateu na paredet
    {
        return 1;
    }

    return 0;
}

int gameLoop(char tabuleiro[20][20], Cobra &c, char &direcao)
{
    int tecla = getch();

    if (tecla != ERR)
    {
        if ((tecla == 'w' && direcao != 's') ||
            (tecla == 's' && direcao != 'w') ||
            (tecla == 'a' && direcao != 'd') ||
            (tecla == 'd' && direcao != 'a'))
        {
            direcao = tecla;
        }
    }
    mostrarTabuleiro(tabuleiro);
    usleep(300000);
    moverCobra(c, tabuleiro, direcao);
    clear();

    if (verificarColisao(c) == 1)
    {
        return 1;
    }
    else
    {
        return 0;
    }
}

int main()
{

    initscr();
    cbreak();
    noecho();
    keypad(stdscr, TRUE);
    nodelay(stdscr, TRUE); // Não trava o jogo esperando tecla
    curs_set(0);

    char tabuleiro[20][20] = {'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x',
                              'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'};
    Cobra c;
    c.corpo.push_back({10, 10});
    char direcao = 'd';
    bool fim = false;

    int continua = gameLoop(tabuleiro, c, direcao);

    while (continua == 0)
    {   
        continua = gameLoop(tabuleiro, c, direcao);
    }
    
    endwin(); // FINALIZA A NCURSES ANTES DE SAIR
    printf("Game Over! Voce bateu na parede.\n");

    return 0;
}
/*
So roda no linux,

-lib nessesaria sudo apt-get install libncurses5-dev libncursesw5-dev
-g++ JogoDaCobra.cpp -o JogoDaCobra -lncurses && ./JogoDaCobra



*/