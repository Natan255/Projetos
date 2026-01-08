#include <iostream>
#include <cstdlib>
#include <string>
#include <vector>
#include <windows.h>
#include <ctime>
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
    for (int i = 0; i < 20; i++)
    {
        for (int j = 0; j < 20; j++)
        {
            cout << tabuleiro[i][j] << ' ';
        }
        cout << endl;
    }
}

void gerarMaca(char tabuleiro[20][20])
{
    srand(time(0));
    int linha = rand() % 18 + 1;
    int coluna = rand() % 18 + 1;
    tabuleiro[linha][coluna] = 'M';
}

void moverCobra(Cobra &c, char tabuleiro[20][20])
{

    for (int i = 0; i < c.corpo.size(); i++)
    {
        c.corpo[i].j++;
        tabuleiro[c.corpo[0].i][c.corpo[0].j] = 'o';
        tabuleiro[c.corpo[0].i][c.corpo[0].j - 1] = ' ';
    }
}

int verificarColisao(char tabuleiro[20][20], Cobra &c)
{
    if (c.corpo[0].j == 0 || c.corpo[0].j == 19 || c.corpo[0].i == 0 || c.corpo[0].i == 19) // verifica se a cabeça bateu na paredet
    {
        return 1;
    }
    
}

int gameLoop(char tabuleiro[20][20], Cobra &c)
{
    mostrarTabuleiro(tabuleiro);
    Sleep(300);
    moverCobra(c, tabuleiro);
    system("cls");
    if (verificarColisao(tabuleiro, c) == 1)
    {
        return 1;
    }else{
        return 0;
    }
    
}



int main()
{
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
    int fim;
    c.corpo.push_back({1, 1});
    tabuleiro[c.corpo[0].i][c.corpo[0].j] = 'o';
    fim = gameLoop(tabuleiro, c);

    while (fim == 0)
    {
        fim = gameLoop(tabuleiro, c);
        
    }
    mostrarTabuleiro(tabuleiro);
    return 0;
}
/*

main.cpp
gameLoop()
desenharTabuleiro()
moverCobra()
gerarComida()
verificarColisao()

*/