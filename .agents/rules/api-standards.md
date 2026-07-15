# Padrões de API e Versionamento

Todas as APIs expostas por este repositório utilizam versionamento nativo estruturado e respostas padronizadas.

1. **Validação Rigorosa de Versão (V1 vs V2):** Ao ser instruído a criar ou modificar um endpoint, **não assuma automaticamente** que a versão da rota seja `/v1`. Você deve validar o escopo da tarefa, inspecionar o controlador atual ou o contexto do desenvolvimento para confirmar se a funcionalidade pertence à `V1`, à `V2` ou a alguma versão posterior.
2. **RESTful e Padrões de Resposta:** As rotas devem seguir os princípios de design REST.
3. **Paginação:** Para consultas que retornem listas, implemente ou respeite sempre os utilitários genéricos de paginação do projeto, mantendo os contratos consistentes.
