export const getLevelBadgeColor = (level) => {
  const colors = {
    easy: "bg-green-100 text-[#111933] border-green-200",
    medium: "bg-yellow-100 text-[#111933] border-yellow-200",
    hard: "bg-red-100 text-[#111933] border-red-200",
  };
  return (
    colors[level?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200"
  );
};

export const renderTags = (tags) => {
  if (!tags) return null;
  const tagArray = typeof tags === "string" ? tags.split(",") : tags;
  return (
    <div className="flex flex-wrap gap-2">
      {tagArray.map((tag, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200"
        >
          {tag.trim()}
        </span>
      ))}
    </div>
  );
};
