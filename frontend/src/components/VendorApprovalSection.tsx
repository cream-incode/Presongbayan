import type { ApprovalStatus, Vendor } from "../services/vendorApi"; // "import type" tells TypeScript these are only types and get erased when the app builds. Your tsconfig demands this for types, so without it you get the red error.
// the props this component needs. DIP-ish: it depends on plain data and callbacks, not on the api or the hook.
type VendorApprovalSectionProps = {
	vendors: Vendor[]; // the pending vendors to show.
	message: string; // an error text to show, or empty if everything's fine.
	onDecide: (id: number, status: ApprovalStatus) => void; // function the parent gives us. we call it when a button is clicked.
};

// SRP: this file is only the look of the vendor list. no loading logic here.
function VendorApprovalSection({
	vendors,
	message,
	onDecide,
}: VendorApprovalSectionProps) {
	return (
		<div className="mt-10">
			{" "}
			{/* spacing above the section so it doesn't stick to the pending card. matches the page's mt-10 blocks. */}
			<h3 className="text-xl font-bold">V endor Approvals</h3>{" "}
			{/* section title. same size as "Vendor Submissions" below it. */}
			<p className="mt-1 text-sm text-[#68746D]">
				Approve or reject vendors who just registered.
			</p>{" "}
			{/* short helper text in the muted color. */}
			{message && ( // only renders if there's an error message. an empty string is falsy so nothing shows.
				<p role="status" className="mt-3 text-sm text-[#C96F52]">
					{message}
				</p> // role="status" lets screen readers announce it. the color matches your reject red.
			)}
			<div className="mt-6 space-y-4">
				{" "}
				{/* stacks the cards with equal gaps. same as the price submissions list. */}
				{vendors.map(
					(
						vendor, // makes one card per pending vendor. the key helps react track each one.
					) => (
						<div
							key={vendor.id}
							className="rounded-2xl border border-[#E5E1D7] bg-white p-6"
						>
							<div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
								{" "}
								{/* column on phones and row on bigger screens. same layout as the price cards. */}
								<div>
									<span className="rounded-full bg-[#FFF3DD] px-3 py-1 text-xs font-semibold text-[#94651C]">
										Pending Approval
									</span>{" "}
									{/* amber badge like your Pending Review badge. it's always pending here. */}
									<h4 className="mt-3 text-lg font-bold">{vendor.fullName}</h4>{" "}
									{/* the vendor's name. */}
									<p className="mt-1 text-sm text-[#68746D]">
										{vendor.email}
									</p>{" "}
									{/* the vendor's email in muted text. */}
								</div>
								<div className="flex gap-2">
									{" "}
									{/* holds the two buttons side by side. */}
									<button
										type="button" // keeps it from acting like a submit button. we're not in a form anyway.
										onClick={() => onDecide(vendor.id, "approved")} // tells the parent to approve this vendor. the arrow function makes sure it only runs on click.
										className="rounded-lg bg-[#286247] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1C4635]"
									>
										Approve
									</button>
									<button
										type="button" // same reason as the approve button.
										onClick={() => onDecide(vendor.id, "rejected")} // tells the parent to reject this vendor.
										className="rounded-lg border border-[#C96F52] px-4 py-2 text-sm font-semibold text-[#C96F52] hover:bg-[#FFF0EA]"
									>
										Reject
									</button>
								</div>
							</div>
						</div>
					),
				)}
				{vendors.length === 0 && ( // empty state so the admin knows the list isn't just broken.
					<div className="rounded-2xl border border-[#E5E1D7] bg-white p-10 text-center">
						<h4 className="font-semibold">No pending vendors</h4>{" "}
						{/* short title for the empty box. */}
						<p className="mt-2 text-sm text-[#68746D]">
							New vendor registrations will appear here.
						</p>{" "}
						{/* tells them when stuff will show up. */}
					</div>
				)}
			</div>
		</div>
	);
}

export default VendorApprovalSection; // default export to match your other components.
