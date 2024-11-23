import { SocketProvider } from "@/context/socketProvider";

export default function SpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
}
