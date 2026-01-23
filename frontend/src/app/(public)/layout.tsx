
export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <section className="min-h-screen flex flex-col">
                <header className="">
                    <h1>Public Layout</h1>
                </header>
                <main>
                    {children}
                </main>
            </section>
        </>
    )
}
