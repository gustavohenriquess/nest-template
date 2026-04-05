export interface IPrismaService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  // Permitir acesso a propriedades dinâmicas do PrismaClient
  [key: string]: any;
}
