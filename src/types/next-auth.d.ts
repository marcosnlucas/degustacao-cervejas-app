import 'next-auth';
import 'next-auth/jwt';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Retornado pela `useSession`, `getSession` e recebido como prop para o `SessionProvider`
   */
  interface Session {
    user: {
      /** O id do usuário do banco de dados. */
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  /** Retornado pelo callback `jwt` e `getToken`, ao usar sessões JWT */
  interface JWT {
    id: string;
  }
}
