import { SocketProvider } from "@/context/socketProvider";

export default async function SpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
}
