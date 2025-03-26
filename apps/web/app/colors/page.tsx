import PaletteGenerator from "@/components/colors/palette-generator";

export default function ColorsPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-24 md:px-8 lg:px-24">
      <div className="mx-auto w-full max-w-6xl">
        <PaletteGenerator />
      </div>
    </div>
  );
}
