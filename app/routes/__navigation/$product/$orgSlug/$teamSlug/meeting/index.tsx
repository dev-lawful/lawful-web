import { useHMSActions } from "@100mslive/react-sdk";

const MeetingIndexPage = () => {
  const hmsActions = useHMSActions();
  return (
    <button
      onClick={() => {
        hmsActions.join({ userName: "Gian Tester", authToken: "" });
      }}
    >
      Join
    </button>
  );
};

export default MeetingIndexPage;
