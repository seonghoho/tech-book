import { GithubIcon, MailIcon, PhoneIcon } from "@/assets/svg";
import Image from "next/image";

const page = () => {
  const contactData = [
    { icon: PhoneIcon, content: "010-5512-4339", type: "tel" },
    { icon: MailIcon, content: "chltjdgh3@naver.com", type: "mailto" },
    { icon: GithubIcon, content: "https://github.com/seonghoho", type: "link" },
  ];

  return (
    <div className="flex sm:flex-row flex-col my-10 mx-auto justify-center gap-4">
      <div className="flex flex-1 justify-center">
        <div className="relative w-[250px] h-[300px] sm:w-[300px] sm:h-full">
          <Image
            className="rounded-xl object-cover"
            src="/images/Profile.JPG"
            alt="프로필 사진"
            width={300}
            height={400}
            priority
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 mx-auto justify-center sm:gap-6 gap-2 ">
        <div>
          <div className="sm:text-[36px] text-[24px] font-semibold">최성호</div>
          <div className="sm:text-[20px] text-[16px]">FrontEnd Developer</div>
        </div>

        <div>
          {contactData.map((data, index) => {
            let href = "#";
            if (data.type === "tel") href = `tel:${data.content}`;
            else if (data.type === "mailto") href = `mailto:${data.content}`;
            else if (data.type === "link") href = data.content;

            return (
              <a
                key={index}
                href={href}
                target={data.type === "link" ? "_blank" : undefined}
                rel={data.type === "link" ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 mt-2 sm:text-[16px] text-[14px] hover:underline"
              >
                <data.icon className="sm:w-5 sm:h-5 w-4 h-4" />
                <span>{data.content}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default page;
