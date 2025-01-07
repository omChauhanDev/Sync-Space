import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function SendInvite({
  setIsInviteOpen = undefined,
}: {
  setIsInviteOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: session } = useSession();

  const cleanInviteLink = () => {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    // Remove query parameters for audio and video preferences
    url.searchParams.delete("initialAudio");
    url.searchParams.delete("initialVideo");
    return url.toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://localhost:8000/api/mail/send-invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            senderFullName: session?.user?.name || "Anonymous User",
            inviteLink: cleanInviteLink(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send invitation");
      }

      setIsDialogOpen(false);
      setEmail("");
      toast.success(
        <div className='flex items-center gap-2 text-md font-bold'>
          <span>Invite Sent</span>
        </div>
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong on our end"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(value) => {
        setIsDialogOpen(value);
        if (setIsInviteOpen) {
          setIsInviteOpen(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <button className='btn btn-outline btn-secondary'>
          <FontAwesomeIcon icon={faEnvelope} className='mr-2' />
          Share via Email
        </button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Send Invitation</DialogTitle>
          </DialogHeader>
          <div className='flex gap-4 py-4 items-center justify-center w-full'>
            <div className='grid grid-cols-8 items-center gap-4 w-full'>
              <Label htmlFor='email' className='text-right'>
                Email
              </Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='user@gmail.com'
                className='col-span-7'
                required
                disabled={isLoading}
              />
            </div>
          </div>
          {error && (
            <div className='text-red-500 text-sm mb-4 text-center'>{error}</div>
          )}
          <DialogFooter>
            <div className='flex items-center justify-between w-full'>
              <DialogClose asChild>
                <Button type='button' variant='outline' disabled={isLoading}>
                  Close
                </Button>
              </DialogClose>
              <Button type='submit' disabled={isLoading || !email}>
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
