#include <iostream>
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
};

void mostrarTabuleiro(char tabuleiro[20][20])
{
    move(0, 0); // evita piscar
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
    int linha, coluna;
    do
    {
        linha = rand() % 18 + 1;
        coluna = rand() % 18 + 1;
    } while (tabuleiro[linha][coluna] != ' ');

    tabuleiro[linha][coluna] = 'M';
}

void moverCobra(Cobra &c, char tabuleiro[20][20], char direcao)
{

    Posicao novaCabeca = c.corpo[0];
    if (direcao == 'd')
        novaCabeca.j++;
    if (direcao == 'a')
        novaCabeca.j--;
    if (direcao == 'w')
        novaCabeca.i--;
    if (direcao == 's')
        novaCabeca.i++;

    if (tabuleiro[novaCabeca.i][novaCabeca.j] == 'M')
    {

        c.corpo.insert(c.corpo.begin(), novaCabeca);
        gerarMaca(tabuleiro);
    }
    else
    {
        Posicao caudaAntiga = c.corpo.back();
        tabuleiro[caudaAntiga.i][caudaAntiga.j] = ' ';

        for (int i = c.corpo.size() - 1; i > 0; i--)
        {
            if (novaCabeca.i == c.corpo[i].i && novaCabeca.j == c.corpo[i].j)
                ;
            c.corpo[i] = c.corpo[i - 1];
        }
        c.corpo[0] = novaCabeca;
    }
    tabuleiro[c.corpo[0].i][c.corpo[0].j] = 'o';
}

int verificarColisao(Cobra &c)
{
    // Colisão com parede
    if (c.corpo[0].j <= 0 || c.corpo[0].j >= 19 || c.corpo[0].i <= 0 || c.corpo[0].i >= 19)
    {
        return 1;
    }

    for (int i = c.corpo.size() - 1; i > 0; i--)
    {
        if (c.corpo[0].i == c.corpo[i].i && c.corpo[0].j == c.corpo[i].j){
            return 1;
        }
            
    }

    return 0;
}

int main()
{
    srand(time(0));
    initscr();
    cbreak();
    noecho();
    keypad(stdscr, TRUE);
    nodelay(stdscr, TRUE);
    curs_set(0);

    char tabuleiro[20][20];
    for (int i = 0; i < 20; i++)
    {
        for (int j = 0; j < 20; j++)
        {
            if (i == 0 || i == 19 || j == 0 || j == 19)
                tabuleiro[i][j] = 'x';
            else
                tabuleiro[i][j] = ' ';
        }
    }

    Cobra c;
    c.corpo.push_back({10, 10});
    tabuleiro[10][10] = 'o';

    gerarMaca(tabuleiro); // Gera a primeira maçã

    char direcao = 'd';
    while (true)
    {
        int tecla = getch();
        if (tecla != ERR)
        {
            if (tecla == 'q')
                break;
            if (tecla == 'w' && direcao != 's')
                direcao = tecla;
            if (tecla == 's' && direcao != 'w')
                direcao = tecla;
            if (tecla == 'a' && direcao != 'd')
                direcao = tecla;
            if (tecla == 'd' && direcao != 'a')
                direcao = tecla;
        }

        moverCobra(c, tabuleiro, direcao);

        if (verificarColisao(c))
            break;

        mostrarTabuleiro(tabuleiro);
        usleep(150000);
    }

    endwin();
    printf("Game Over! Score: %ld\n", c.corpo.size());
    return 0;
}
/*
So roda no linux,

-lib nessesaria sudo apt-get install libncurses5-dev libncursesw5-dev
-g++ JogoDaCobra.cpp -o JogoDaCobra -lncurses && ./JogoDaCobra



*/