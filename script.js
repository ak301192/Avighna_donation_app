document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('donationForm');

  if (!form) return;

  const amountInput = document.getElementById('donationAmount');
  const amountChips = document.querySelectorAll('.amount-chip');

  amountChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const value = chip.dataset.amount;
      amountInput.value = value;
      amountChips.forEach((item) => item.classList.toggle('active', item === chip));
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('donorName').value.trim();
    const email = document.getElementById('donorEmail').value.trim();
    const amount = document.getElementById('donationAmount').value.trim();
    const phone = document.getElementById('donorPhone').value.trim();
    const address = document.getElementById('donorAddress').value.trim();
    const type = document.getElementById('donationType').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !amount || !phone) {
      alert('Please complete all required fields before donating.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (Number(amount) <= 0) {
      alert('Donation amount must be greater than zero.');
      return;
    }

    const donation = {
      name,
      email,
      phone,
      address,
      amount,
      type,
      message,
      timestamp: new Date().toISOString()
    };

    const submitButton = form.querySelector('.donate-btn');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending confirmation...';

    try {
      localStorage.setItem('hopeBridgeDonation', JSON.stringify(donation));

      const response = await fetch('/api/confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, amount, type })
      });
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(`The server returned an unexpected response (${response.status}). Restart the local server and try again.`);
      }

      if (!response.ok) {
        throw new Error(result.message || 'The confirmation email could not be sent.');
      }

      const params = new URLSearchParams({
        name,
        email,
        amount,
        type,
        message
      });

      window.location.href = `success.html?${params.toString()}`;
    } catch (error) {
      console.error('Confirmation email request failed:', error);
      alert(error.message || 'The confirmation email could not be sent. Please try again.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Donate now';
    }
  });
});
