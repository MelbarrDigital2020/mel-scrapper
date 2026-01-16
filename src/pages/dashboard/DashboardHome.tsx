export default function DashboardHome() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* Horizontal Scroll Section */}
      <section>
        <h2 className="text-sm font-medium text-text-secondary mb-3">
          Horizontal Scroll (Cards)
        </h2>

        <div className="overflow-x-auto">
          <div className="flex gap-4 w-max">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="
                  min-w-[240px] h-32
                  bg-background-card
                  border border-border-light
                  rounded-xl
                  p-4
                  flex items-center justify-center
                "
              >
                Card {i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vertical Scroll Section */}
      <section>
        <h2 className="text-sm font-medium text-text-secondary mb-3">
          Vertical Scroll (List)
        </h2>

        <div className="space-y-4">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="
                h-20
                bg-background-card
                border border-border-light
                rounded-xl
                p-4
                flex items-center
              "
            >
              Row Item {i + 1}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
