export default function CollaboratorsMenu() {
  // Replace this with real-time users later
  const users = ["User A", "User B"];

  return (
    <div className="fixed top-1/2 right-5 z-50 -translate-y-1/2">
      <div className="w-56 rounded-md border border-gray-200 bg-white shadow-lg">
        {/* Header */}
        <div className="border-b px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-800">
            👥 Members ({users.length})
          </h3>
        </div>

        {/* Users List */}
        <div className="max-h-60 space-y-2 overflow-y-auto px-2 py-2">
          {users.map((user, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-gray-100"
            >
              {/* Avatar */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                {user.charAt(0)}
              </div>

              {/* Name */}
              <span className="text-sm text-gray-700">{user}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
