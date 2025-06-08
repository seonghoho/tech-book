import { GithubIcon, MailIcon, PhoneIcon } from "@/assets/svg";
import Image from "next/image";

const page = () => {
  const contactData = [
    { icon: PhoneIcon, content: "010-5512-4339", type: "tel" },
    { icon: MailIcon, content: "chltjdgh3@naver.com", type: "mailto" },
    { icon: GithubIcon, content: "https://github.com/seonghoho", type: "link" },
  ];

  return (
    <div className="flex my-10 mx-auto justify-center ">
      <div className="flex flex-1 justify-center">
        <Image
          className="rounded-xl"
          src="/images/Profile.JPG"
          alt="profile-image"
          width={300}
          height={400}
        />
      </div>
      <div className="flex flex-col flex-1 justify-between py-14">
        <div>
          <div className="text-[36px] font-semibold">최성호</div>
          <div className="text-[20px]">FrontEnd Developer</div>
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
                className="flex items-center gap-2 mt-2 text-[16px] hover:underline"
              >
                <data.icon className="w-5 h-5" />
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
