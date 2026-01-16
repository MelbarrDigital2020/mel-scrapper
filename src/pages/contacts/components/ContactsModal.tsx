export default function ContactsModal() {
  return (
    <div className="hidden fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[480px] bg-background-card border border-border-light rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Details</h3>

        <div className="space-y-2 text-sm">
          <p><strong>Name:</strong> John Doe</p>
          <p><strong>Company:</strong> PwC</p>
          <p><strong>Email:</strong> john@pwc.com</p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary">Close</button>
          <button className="btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}
