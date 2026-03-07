

import { HandleBackBtn } from "@/components";

export default function DormitoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="container mx-auto px-10">
            <header className="py-6">
                <HandleBackBtn defaultLink="dormitories" />

            </header>

            <div>
                {children}
            </div>
        </section>
    )
}
