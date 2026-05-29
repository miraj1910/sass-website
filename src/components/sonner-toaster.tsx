import { Toaster } from "sonner";

export default function SonnerToaster() {
  return (
    <Toaster
      position="top-right"
      swipeDirections={["right"]}
      offset={10}
      duration={5000}
      theme="dark"
      toastOptions={{
        style: {
          background: "#18181b",
          border: "1px solid #27272a",
          color: "#f4f4f5",
          fontSize: "14px",
        },
      }}
    />
  );
}
