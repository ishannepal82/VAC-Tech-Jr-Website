import { ArrowBigRightDash } from "lucide-react";
const Notification = () => {
  return (
    <>
      <div className=" w-full h-screen flex items-center justify-center m-auto bg-black/10  ">
        <div className=" w-[75%] h-[70%] bg-[#1a2f55] rounded-3xl">
          <div className="flex justify-between my-3">
            <h1 className="text-4xl font-bold text-blue-300 text-left mt-4 ml-10">
              Mail Box
            </h1>
            <button className=" items-end px-10 py-4 transition">
              <ArrowBigRightDash
                size={35}
                className="text-blue-300 hover:text-blue-400"
              />
            </button>
          </div>
          <div className="w-[96%] bg-[#0a1a33] rounded-3xl m-auto"></div>
        </div>
      </div>
    </>
  );
};

export default Notification;
