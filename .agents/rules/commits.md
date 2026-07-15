# Padrão de Commits

Sempre que realizar commits neste repositório, você **deve** seguir estritamente o padrão [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Estrutura do Commit
O formato da mensagem do commit deve ser:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Tipos Permitidos (`type`):
- `feat`: Uma nova funcionalidade
- `fix`: A correção de um bug
- `docs`: Alterações apenas na documentação
- `style`: Alterações que não afetam o significado do código (espaços em branco, formatação, falta de ponto e vírgula, etc)
- `refactor`: Uma alteração de código que não corrige um bug nem adiciona uma funcionalidade
- `perf`: Uma alteração de código que melhora a performance
- `test`: Adição de testes faltantes ou correção de testes existentes
- `build`: Alterações que afetam o sistema de build ou dependências externas
- `ci`: Alterações nos arquivos e scripts de configuração do CI
- `chore`: Outras alterações que não modificam arquivos de código ou de teste

## Regras Importantes:
1. **Idioma**: Procure manter a mensagem principal (`description`) clara e concisa (preferencialmente em inglês se for o padrão do time, ou respeitando o idioma vigente do projeto).
2. **Imperativo**: A descrição deve ser no modo imperativo (ex: `add user login` ao invés de `added user login` ou `adds user login`).
3. **Breaking Changes**: Se a mudança introduzir uma quebra de compatibilidade, adicione `!` logo antes do `:` no cabeçalho (ex: `feat(api)!: change response format`).
4. **Commits Atômicos**: Mantenha os commits o mais granulares e focados possível. Nunca faça commits genéricos como "várias alterações".
