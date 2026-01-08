#include <iostream>
#include <string>
using namespace std;

int verificarVencedor(char tabuleiro[3][3]) {

    // Verificar linhas
    for (int i = 0; i < 3; i++) {
        int contX = 0, contO = 0;

        for (int j = 0; j < 3; j++) {
            if (tabuleiro[i][j] == 'x') contX++;
            if (tabuleiro[i][j] == 'o') contO++;
        }

        if (contX == 3 || contO == 3)
            return 1;
    }

    // Verificar colunas
    for (int j = 0; j < 3; j++) {
        int contX = 0, contO = 0;

        for (int i = 0; i < 3; i++) {
            if (tabuleiro[i][j] == 'x') contX++;
            if (tabuleiro[i][j] == 'o') contO++;
        }

        if (contX == 3 || contO == 3)
            return 1;
    }

    // Diagonal principal
    if ((tabuleiro[0][0] == 'x' && tabuleiro[1][1] == 'x' && tabuleiro[2][2] == 'x') ||
        (tabuleiro[0][0] == 'o' && tabuleiro[1][1] == 'o' && tabuleiro[2][2] == 'o'))
        return 1;

    // Diagonal secundária
    if ((tabuleiro[0][2] == 'x' && tabuleiro[1][1] == 'x' && tabuleiro[2][0] == 'x') ||
        (tabuleiro[0][2] == 'o' && tabuleiro[1][1] == 'o' && tabuleiro[2][0] == 'o'))
        return 1;

    return 0;
}


void mostrarTabuleiro(char tabuleiro[3][3])
{
    cout << endl;

    for (int i = 0; i < 3; i++)
    {
        for (int j = 0; j < 3; j++)
        {
            cout << " " << tabuleiro[i][j] << " ";

            if (j < 2)
                cout << "|";
        }

        cout << endl; // linha de baixo

        if (i < 2)
            cout << "---+---+---" << endl;
    }

    cout << endl;
}

int cordenadas(int &jogador, char tabuleiro[3][3])
{

    int i, j;
    cout << "diga as cordenas i e j P" << jogador << ": " << endl;
    cin >> i >> j;

    if (i > 2 || i < 0 || j < 0 || j > 2 || cin.fail())
    {
        cout << "Por favor insira numeros validos de 0 a 2 !" << endl;
        return 1;
    }
    if (tabuleiro[i][j] != ' ')
    {
        cout << "Posicao ja ocupada, escolha outra" << endl;
        return 1;
    }

    if (jogador == 1)
    {
        tabuleiro[i][j] = 'x';
        jogador = 2;
    }
    else
    {
        tabuleiro[i][j] = 'o';
        jogador = 1;
    }
    
    mostrarTabuleiro(tabuleiro);
    return 0;
}

int main()
{
    int jogador = 1;
    char tabuleiro[3][3] = {
        {' ', ' ', ' '},
        {' ', ' ', ' '},
        {' ', ' ', ' '}};

    cout << " JOGO DA VELHA " << endl;
    mostrarTabuleiro(tabuleiro);
    for (int i = 0; i < 10; i++)
    {
        
        if (verificarVencedor(tabuleiro) == 1)break;
        if (cordenadas(jogador, tabuleiro) == 1){
            i--;
            continue;
        }
        
        if (i == 8){
            cout << "Deu velha!" << endl;
            break;
        }
    }
}
