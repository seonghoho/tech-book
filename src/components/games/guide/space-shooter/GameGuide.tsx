const GameGuide = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-press flex flex-col sm:flex-row items-center justify-center font-semibold text-lg py-2">
        <span>방향키를 이용해 </span>
        <span>장애물을 제거하세요!</span>
      </div>
      <div className="font-press flex flex-col lg:flex-row gap-4 justify-center items-center text-sm">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-center sm:justify-between w-full sm:w-auto">
          <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
            <span>이동</span>
            <span>← →</span>
          </div>
          <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
            <span>점프</span>
            <span>Space</span>
          </div>
          <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
            <span>공격</span>
            <span>Z/X/C</span>
          </div>
        </div>
        {/* <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-center sm:justify-between w-full sm:w-auto">
          <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
            <span>쉴드</span>
            <span>Q</span>
          </div>
          <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
            <span>캐릭터 선택</span>
            <span>1/2/3</span>
          </div>
          <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
            <span>배경</span>
            <span>Tab+1/Tab+2</span>
          </div>
          <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
            <span>재시작</span>
            <span>R</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default GameGuide;
