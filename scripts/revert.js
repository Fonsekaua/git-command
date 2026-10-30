const { execFileSync } = require('node:child_process');
const readline = require('node:readline/promises');

function git(...args) {
  execFileSync('git', args, { stdio: 'inherit' });
}

function gitTexto(...args) {
  return execFileSync('git', args, { encoding: 'utf-8' }).trim();
}

async function main() {
  if (gitTexto('status', '--porcelain')) {
    console.error('Você tem alterações não salvas. Faça um commit ou rode "git stash" antes.');
    process.exit(1);
  }

  console.log('Últimos commits (o mais recente primeiro):\n');
  git('log', '--oneline', '-10');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const resposta = (await rl.question('\nQuantos commits quer desfazer? (Enter = 1): ')).trim() || '1';
  const quantidade = Number(resposta);
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    rl.close();
    console.error('Número inválido.');
    process.exit(1);
  }

  console.log('\nEstes commits serão desfeitos:\n');
  git('log', '--oneline', `-${quantidade}`);

  const confirma = (await rl.question('\nConfirma? (s/n): ')).trim().toLowerCase();
  rl.close();
  if (confirma !== 's') {
    console.log('Cancelado. Nada foi alterado.');
    process.exit(0);
  }

  try {
    git('revert', '--no-edit', `HEAD~${quantidade}..HEAD`);
  } catch {
    console.error('\nO revert parou por causa de um conflito.');
    console.error('Resolva os arquivos marcados e rode "git revert --continue", ou cancele com "git revert --abort".');
    process.exit(1);
  }

  git('push');
  console.log('\nPronto! O código voltou à versão anterior, e o GitHub já está atualizado.');
}

main();