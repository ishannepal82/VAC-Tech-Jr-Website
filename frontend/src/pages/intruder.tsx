import intruder_img from "../assets/intruder.svg";
export const intruder = () => {
  return (
    <>
      <div className="bg-[#0a1a33] w-screen h-screen">
        <div className="flex flex-col items-center justify-center h-screen">
          <img src={intruder_img} alt="Intruder" className="w-40% h-70% " />
          <h1 className="text-4xl font-bold text-blue-300 mb-4">404</h1>
          <p className="text-xl text-blue-300 mb-8">Page Not Found !! :)</p>
        </div>
      </div>
    </>
  );
};
