import Head from 'next/head';
import MultiplayerGame from '../components/MultiplayerGame';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Multiplayer Snake Party</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <MultiplayerGame />
    </>
  );
}
