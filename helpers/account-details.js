// Assuming you have jQuery available based on the HTML includes

// Function to format a single transaction into HTML
function createTransactionHtml(transaction) {
    // Determine amount class (plus or minus)
    const amountClass = transaction.isNegativeBalance ? 'amount-minus' : 'amount-plus';
    // Format amount (ensure it has 2 decimal places, handle potential missing balance)
    const formattedAmount = transaction.balance ? parseFloat(transaction.balance.replace(/,/g, '')).toFixed(2) : '0.00';
    // Add comma separators back if needed for display
    const displayAmount = parseFloat(formattedAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
     // Add the sign back if it's negative
    const finalDisplayAmount = transaction.isNegativeBalance ? `-${displayAmount}` : displayAmount;


    // Format date/time (you might need a more robust parser if format varies)
    // Example: "23 เม.ย. 16:53 น." -> "23 เม.ย. 16:53 น." (already formatted in HTML)
    const displayDateTime = transaction.dateTime || 'N/A';

    // Basic HTML structure matching the existing items
    return `
        <div class="transaction-sub-item" id="transaction-${transaction.transSeqNo}">
            <div class="sub-item-wrapper">
                <div class="transaction-type">${transaction.type || 'N/A'}</div>
                <div class="transaction-datetime">${displayDateTime}</div>
            </div>
            <div class="sub-item-wrapper">
                <div class="transaction-cmt">${transaction.cmt || ''}</div>
                <div class="transaction-amount ${amountClass}">${finalDisplayAmount}</div>
            </div>
        </div>
    `;
}


// The onClick function called by the button
async function viewMore() {
    const btnViewMore = $('#btnViewMore');
    const loadingOverlay = $('#loadingOverlayContent'); // Assuming this is your loading overlay ID
    const transactionListDiv = $('#transactionList');

    // Prevent multiple clicks while loading
    if (btnViewMore.hasClass('loading')) {
        return;
    }

    btnViewMore.addClass('loading').text('Loading...'); // Indicate loading state
    loadingOverlay.show(); // Show loading overlay

    try {
        // Prepare data for the backend
        const requestData = {
            // You might need bankAccountId instead of accountTokenNumber depending on your backend route
            // bankAccountId: window.bankAccountId, // Assuming you have this available
            accountTokenNumber: window.accountTokenNumber, // Or use this if backend expects it
            lastSeq: window.lastSeq // Get the last sequence number from the global scope
        };

        // Make the AJAX call to your backend endpoint
        const response = await fetch('/api/v1/krungthai/view-more', { // Adjust URL as needed
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                // Add authorization headers if required
                // 'Authorization': 'Bearer ' + your_token
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            // Handle HTTP errors (e.g., 404, 500)
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response from backend

        // Check if the backend operation was successful (based on your ReS/ReE structure)
        if (data && data.success === true && data.data) { // Adjust based on your actual backend response structure from ReS
            const responseData = data.data; // Access the actual data payload

            // Append new transactions
            if (responseData.transactions && responseData.transactions.length > 0) {
                responseData.transactions.forEach(tx => {
                    const txHtml = createTransactionHtml(tx);
                    transactionListDiv.append(txHtml);
                });

                // Update the global lastSeq with the new value from the response
                window.lastSeq = responseData.lastSeq;
                console.log("Updated lastSeq:", window.lastSeq);

            } else {
                // No more transactions received, treat as if hasViewMore is false
                console.log("No more transactions received.");
                responseData.hasViewMore = false;
            }

            // Hide "View More" button if no more data
            if (!responseData.hasViewMore) {
                $('#btnViewMore').parent().hide(); // Hide the container div
            }

        } else {
            // Handle backend errors indicated in the response payload
            throw new Error(data.error || 'Backend request failed.');
        }

    } catch (error) {
        console.error('Error fetching more transactions:', error);
        // Display error to user (e.g., using SweetAlert)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to load more transactions: ${error.message}`,
        });
        // Optionally hide the button on persistent error
        // $('#btnViewMore').parent().hide();
    } finally {
        // Always run this: remove loading state and hide overlay
        btnViewMore.removeClass('loading').text(window.contentInfo.btnViewMore || 'View More'); // Reset button text (get text from i18n if possible)
        loadingOverlay.hide(); // Hide loading overlay
    }
}

// Initial setup (ensure button text is set if using i18n)
$(document).ready(function() {
    // Assuming contentInfo.btnViewMore holds the localized text for "View More"
    // You might need to fetch this text or have it pre-rendered
    // Example: window.contentInfo = { btnViewMore: "ดูเพิ่มเติม" };
    if (window.contentInfo && window.contentInfo.btnViewMore) {
         $('#btnViewMore').text(window.contentInfo.btnViewMore);
    } else {
         $('#btnViewMore').text('View More'); // Default text
    }

    // Hide button initially if hasViewMore is false on page load
    if (window.accountDetail && window.accountDetail.hasViewMore === false) {
         $('#btnViewMore').parent().hide();
    }
});
